const Tree = require('../base-test-reporter/intellij-tree');
const util = require('../base-test-reporter/intellij-util');
const stringifier = require('../base-test-reporter/intellij-stringifier');
const path = require('path');
const processStdoutWrite = process.stdout.write.bind(process.stdout);
const processStderrWrite = process.stderr.write.bind(process.stderr);

function addTestFileNode(tree, testFilePath) {
  return tree.root.addTestSuiteChild(path.basename(testFilePath), 'file', testFilePath);
}

function isSuiteNode(node) {
  return node && typeof node.addTestSuiteChild === 'function';
}

function sendConsoleLog(testNode, log) {
  if (log.type === 'stdout') {
    testNode.addStdOut(log.content);
  }
  else {
    testNode.addStdErr(log.content);
  }
}

function finishTestNode(testTask, testNode) {
  const result = testTask.result;
  const outcome = getOutcome(testTask);
  let failureMessage, failureStack, failureExpectedStr, failureActualStr;
  const resultError = result != null ? result.error : null;
  if (resultError != null) {
    const normalizedError = normalizeError(resultError);
    failureMessage = normalizedError.message;
    failureStack = normalizedError.stack;
    if (resultError.expected !== resultError.actual) {
      failureExpectedStr = stringifier.stringify(resultError.expected);
      failureActualStr = stringifier.stringify(resultError.actual);
      testNode.setPrintExpectedAndActualValues(shouldPrintExpectedAndActualValues(failureMessage, failureExpectedStr, failureActualStr));
    }
  }
  if ((outcome === Tree.TestOutcome.FAILED || outcome === Tree.TestOutcome.ERROR) && process.env.JB_VITEST_LOG_TEST_FAILURE_DETAILS) {
    testNode.addStdOut('[intellij] "' + testNode.name + '" failure details: ' + stringifier.stringify(result));
  }
  if (!failureMessage && isTodo(testTask)) {
    failureMessage = `Todo '${testTask.name}'`;
  }
  let durationMillis = result != null ? result.duration : null;
  testNode.setOutcome(outcome, durationMillis, failureMessage, failureStack, failureExpectedStr, failureActualStr, null, null);
  testNode.finish(false);
}

function normalizeError(error) {
  const name = error.name || 'Error';
  let message = error.message;
  let stack = error.stack;
  if (!util.isString(stack)) {
    stack = error.stackStr;
  }
  
  if (util.isString(name) && util.isString(message) && util.isString(stack)) {
    const messageLines = splitByLines(message);
    const stackLines = splitByLines(stack);
    if (messageLines.length > 0 && stackLines.length > 0 && messageLines.length <= stackLines.length) {
      messageLines[0] = name + ': ' + messageLines[0]
      if (arrayEqual(messageLines, stackLines.slice(0, messageLines.length))) {
        message = messageLines.join('\n')
        stack = stackLines.slice(messageLines.length).join('\n')
      }
    }
  }
  return {
    name: name,
    message: message,
    stack: stack
  }
}

function arrayEqual(a1, a2) {
  if (a1.length !== a2.length) return false
  for (let i = 0; i < a1.length; ++i) {
    if (a1[i] !== a2[i]) return false
  }
  return true
}

function splitByLines(text) {
  return text.split(/\n|\r\n/);
}

function shouldPrintExpectedAndActualValues(failureMessage, expectedStr, actualStr) {
  const duplicated = util.isString(failureMessage) && util.isString(expectedStr) && util.isString(actualStr) &&
    failureMessage.endsWith("expected '" + actualStr + "' to equal '" + expectedStr + "'");
  return !duplicated;
}

/**
 * @param {TestSuiteNode} parentNode
 * @param {string} nodeName
 * @param {TestSuiteNode} testFileNode
 * @param {string} testFilePath
 * @static
 */
function getLocationPath(parentNode, nodeName, testFileNode, testFilePath) {
  let names = [nodeName], n = parentNode;
  while (n !== testFileNode) {
    names.push(n.name);
    n = n.parent;
  }
  names.push(testFilePath || '');
  names.reverse();
  return util.joinList(names, 0, names.length, '.');
}

/**
 * @param {string} testTask
 * @returns {TestOutcome}
 */
function getOutcome(testTask) {
  const result = testTask.result;
  if (result == null) {
    if (testTask.mode === 'skip') {
      return Tree.TestOutcome.SKIPPED;
    }
    if (isTodo(testTask)) {
      return Tree.TestOutcome.SKIPPED;
    }
    return Tree.TestOutcome.ERROR;
  }
  if (result.state === 'pass') {
    return Tree.TestOutcome.SUCCESS;
  }
  return Tree.TestOutcome.FAILED;
}

function isTodo(testTask) {
  return testTask.mode === 'todo';
}

function warn(message) {
  const str = 'WARN - IDE integration: ' + message + '\n';
  try {
    processStderrWrite(str);
  }
  catch (ex) {
    try {
      processStdoutWrite(str);
    }
    catch (ex) {
      // do nothing
    }
  }
}

function safeFn(fn) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (ex) {
      warn(ex.message + '\n' + ex.stack);
    }
  };
}

function addErrorTestChild(parentNode, childName, failureMsg, failureDetails) {
  const errorNode = parentNode.addTestChild(childName, 'test', null);
  errorNode.setOutcome(Tree.TestOutcome.ERROR, null, failureMsg, failureDetails, null, null, null, null);
  errorNode.start();
  errorNode.finish(false);
}

let globalRunScopeType;
function getRunScopeType() {
  if (globalRunScopeType == null) {
    globalRunScopeType = process.env['_JETBRAINS_VITEST_RUN_SCOPE_TYPE'];
  }
  return globalRunScopeType;
}

function isSuitesOrTestsScope() {
  const runScopeType = getRunScopeType();
  return runScopeType === 'suite' || runScopeType === 'test' || runScopeType === 'selected_tests';
}

function isSingleTestFileScope() {
  const runScopeType = getRunScopeType();
  return runScopeType === 'test_file' || runScopeType === 'suite' || runScopeType === 'test';
}

function configureCoverage(config, tree) {
  if (config) {
    const coverage = config.coverage;
    if (coverage) {
      const root = config.root;
      const reportsDirectory = coverage.reportsDirectory;
      if (util.isString(root) && util.isString(reportsDirectory)) {
        const resolvedCoverageDirectory = path.resolve(root, reportsDirectory)
        coverage.reporter.push('lcov');
        tree.sendMessage('vitest-coverage-config', {coverageDirectory: resolvedCoverageDirectory});
      }
    }
  }
}

exports.addTestFileNode = addTestFileNode;
exports.addErrorTestChild = addErrorTestChild;
exports.finishTestNode = finishTestNode;
exports.isSuiteNode = isSuiteNode;
exports.warn = warn;
exports.safeFn = safeFn;
exports.getLocationPath = getLocationPath;
exports.isSingleTestFileScope = isSingleTestFileScope;
exports.isSuitesOrTestsScope = isSuitesOrTestsScope;
exports.normalizeError = normalizeError;
exports.sendConsoleLog = sendConsoleLog;
exports.configureCoverage = configureCoverage;
