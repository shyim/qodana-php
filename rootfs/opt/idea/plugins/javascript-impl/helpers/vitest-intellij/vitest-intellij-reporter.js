const Tree = require('../base-test-reporter/intellij-tree.js');
const tree = new Tree(null, getStdoutWrite());
const vitestIntellijUtil = require('./vitest-intellij-util');
const path = require('path');

function getStdoutWrite() {
  return process.stdout.write.bind(process.stdout);
}

/** @type {boolean} */
let beforeTestingStart = true;

/** @type {Object<string, TestSuiteNode>} */
let filePathToFileNodeMap = {};

/** @type {Object<string, Stat>} */
let collectedFilePathToTestStatMap = {};

/** @type {Object<string, TestNode>} */
let testIdToTestNodeMap = {};

class Stat {
  collectedTestCount = 0;
  finishedTestCount = 0;
}

tree.startNotify();

function IntellijReporter() {
}

function startTestingIfNeeded() {
  if (beforeTestingStart) {
    tree.testingStarted();
    beforeTestingStart = false;
    filePathToFileNodeMap = {};
    collectedFilePathToTestStatMap = {};
    testIdToTestNodeMap = {};
  }
}

function finishTesting() {
  if (beforeTestingStart) {
    vitestIntellijUtil.warn('Cannot finish not started testing');
    return;
  }
  tree.testingFinished();
  beforeTestingStart = true;
}

IntellijReporter.prototype.onInit = vitestIntellijUtil.safeFn((vitestCtx) => {
  if (process.env['_JETBRAINS_VITEST_RUN_WITH_COVERAGE']) {
    vitestIntellijUtil.configureCoverage(vitestCtx.config, tree);
  }
});

// Not working in vitest
// IntellijReporter.prototype.onPathsCollected = vitestIntellijUtil.safeFn((paths) => {
// });

/**
 * @param {String} filePath
 * @returns {Stat}
 */
function getOrCreateStat(filePath) {
  let stat = collectedFilePathToTestStatMap[filePath];
  if (stat == null) {
    stat = new Stat();
    collectedFilePathToTestStatMap[filePath] = stat;
  }
  return stat;
}

IntellijReporter.prototype.onCollected = vitestIntellijUtil.safeFn((files) => {
  startTestingIfNeeded();
  buildTreeAndProcessTests(files, (testTask, testNode, filePath) => {
    getOrCreateStat(filePath).collectedTestCount++;
    testIdToTestNodeMap[testTask.id] = testNode;
  });
});

function buildTreeAndProcessTests(files, callback) {
  for (const file of files) {
    const filePath = file.filepath;
    const fileNode = getOrCreateFileNode(filePath);
    for (const task of file.tasks) {
      traverseSuitesAndProcessTests(task, [], (ancestorSuiteNames, testTask) => {
        if (testTask.mode === 'skip' && vitestIntellijUtil.isSuitesOrTestsScope()) {
          return; // ignore other tests when running a single suite/test
        }
        let currentParentNode = fileNode;
        for (const suiteName of ancestorSuiteNames) {
          let childSuiteNode = currentParentNode.findChildNodeByName(suiteName);
          if (!vitestIntellijUtil.isSuiteNode(childSuiteNode)) {
            const suiteLocationPath = vitestIntellijUtil.getLocationPath(currentParentNode, suiteName, fileNode, filePath);
            childSuiteNode = currentParentNode.addTestSuiteChild(suiteName, 'suite', suiteLocationPath);
            childSuiteNode.start();
          }
          currentParentNode = childSuiteNode;
        }
        let testNode = currentParentNode.findChildNodeByName(testTask.name);
        if (testNode == null || vitestIntellijUtil.isSuiteNode(testNode)) {
          const testLocationPath = vitestIntellijUtil.getLocationPath(currentParentNode, testTask.name, fileNode, filePath);
          testNode = currentParentNode.addTestChild(testTask.name, 'test', testLocationPath);
          testNode.start();
        }
        callback(testTask, testNode, filePath);
      })
    }
  }
}

function getOrCreateFileNode(filePath) {
  let fileNode = filePathToFileNodeMap[filePath];
  if (fileNode == null) {
    if (vitestIntellijUtil.isSingleTestFileScope()) {
      tree.updateRootNode(path.basename(filePath), path.relative('', path.dirname(filePath)), 'file://' + filePath);
      fileNode = tree.root;
    }
    else {
      fileNode = vitestIntellijUtil.addTestFileNode(tree, filePath);
      fileNode.start();
    }
    filePathToFileNodeMap[filePath] = fileNode;
  }
  return fileNode;
}

function traverseSuitesAndProcessTests(task, suiteNames, callback) {
  if (task.type === 'test') {
    callback(suiteNames, task);
  }
  else if (task.type === 'suite') {
    suiteNames.push(task.name);
    for (const childTask of task.tasks) {
      traverseSuitesAndProcessTests(childTask, suiteNames, callback);
    }
    suiteNames.pop();
  }
}

IntellijReporter.prototype.onUserConsoleLog = vitestIntellijUtil.safeFn((log) => {
  const testNode = testIdToTestNodeMap[log.taskId];
  if (testNode) {
    vitestIntellijUtil.sendConsoleLog(testNode, log);
  }
});

IntellijReporter.prototype.onFinished = vitestIntellijUtil.safeFn((files, errors) => {
  if (beforeTestingStart) {
    vitestIntellijUtil.warn("Got finished tests before collecting them");
  }
  buildTreeAndProcessTests(files, (testTask, testNode, filePath) => {
    vitestIntellijUtil.finishTestNode(testTask, testNode);
    const stat = collectedFilePathToTestStatMap[filePath];
    if (stat != null) {
      stat.finishedTestCount++;
    }
  });
  if (Array.isArray(errors)) {
    for (const error of errors) {
      const normalizedError = vitestIntellijUtil.normalizeError(error);
      vitestIntellijUtil.addErrorTestChild(tree.root, normalizedError.name, normalizedError.message, normalizedError.stack);
    }
  }

  for (const file of files) {
    const filePath = file.filepath;
    const testFileNode = filePathToFileNodeMap[filePath];
    const result = file.result;
    const resultError = result != null ? result.error : null;
    if (resultError != null) {
      const normalizedError = vitestIntellijUtil.normalizeError(resultError);
      vitestIntellijUtil.addErrorTestChild(testFileNode, normalizedError.name, normalizedError.message, normalizedError.stack);
    }
    const stat = getOrCreateStat(filePath);
    if (stat.collectedTestCount === stat.finishedTestCount) {
      testFileNode.children.forEach(function (childNode) {
        childNode.finishIfStarted();
      });
      testFileNode.finish(false);
    }
  }
  if (Object.values(collectedFilePathToTestStatMap).every((stat) => stat.collectedTestCount <= stat.finishedTestCount)) {
    finishTesting();
  }
});

module.exports = IntellijReporter;

/*
function traceCalls(functionName, fn) {
  const old = IntellijReporter.prototype[functionName];
  IntellijReporter.prototype[functionName] = function () {
    process.stdout.write('trace: ' + functionName + '\n');
    if (typeof fn === 'function') {
      fn.apply(this, arguments);
    }
    if (typeof old === 'function') {
      old.apply(this, arguments);
    }
  }
}

traceCalls('onInit');
traceCalls('onPathsCollected');
traceCalls('onCollected', (files) => {
  logFiles('onCollected', files);
});
traceCalls('onFinished', (files) => {
  logFiles('onFinished', files);
});
traceCalls('onTaskUpdate');
traceCalls('onTestRemoved');
traceCalls('onWatcherStart');
traceCalls('onWatcherRerun');
traceCalls('onServerRestart');
traceCalls('onUserConsoleLog');

function logFiles(message, files) {
  process.stdout.write(message + ' ' + files.length + '\n' + files.map(file => '  ' + file.filepath).join('\n') + '\n');
}

*/
