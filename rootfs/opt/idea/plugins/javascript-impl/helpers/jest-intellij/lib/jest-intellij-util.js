const Tree = require('../../base-test-reporter/intellij-tree');
const util = require('../../base-test-reporter/intellij-util');
const stringifier = require('../../base-test-reporter/intellij-stringifier');
const path = require('path');
const processStdoutWrite = process.stdout.write.bind(process.stdout);
const processStderrWrite = process.stderr.write.bind(process.stderr);

function addTestFileNode(tree, testFilePath) {
  return tree.root.addTestSuiteChild(path.basename(testFilePath), 'file', testFilePath);
}

function reportTestFileResults(testFileNode, testResultsPerTestFile, testResultsProcessor) {
  const testFilePath = testResultsPerTestFile.testFilePath;
  const testResults = testResultsPerTestFile.testResults;
  if (typeof testResultsPerTestFile.failureMessage === 'string' && !(Array.isArray(testResults) && testResults.length > 0)) {
    addErrorTestChild(testFileNode, 'Error', testResultsPerTestFile.failureMessage);
  }
  else {
    testResultsProcessor(testFilePath, testResults)
  }
  testFileNode.children.forEach(function (childNode) {
    childNode.finishIfStarted();
  });
  testFileNode.finish(false);
}

function reportSpecResult(testFileNode, testFilePath, testResult, mightBeDuplicate) {
  if (testResult.status === 'pending' && isSuitesOrTestsScope()) {
    return; // When running with `--testNamePattern=<pattern>`, tests not matched by the pattern are reported as 'pending'.
  }
  let currentParentNode = testFileNode;
  testResult.ancestorTitles.forEach(function (suiteTitle) {
    let childSuiteNode = currentParentNode.findChildNodeByName(suiteTitle);
    if (!(childSuiteNode && typeof childSuiteNode.addTestSuiteChild === 'function')) {
      const suiteLocationPath = getLocationPath(currentParentNode, suiteTitle, testFileNode, testFilePath);
      childSuiteNode = currentParentNode.addTestSuiteChild(suiteTitle, 'suite', suiteLocationPath);
      childSuiteNode.start();
    }
    currentParentNode = childSuiteNode;
  });
  if (mightBeDuplicate && currentParentNode.findChildNodeByName(testResult.title) != null) {
    // 'to-do' can be reported twice from onTestCaseResult and from onTestFileResult
    return;
  }
  const testLocationPath = getLocationPath(currentParentNode, testResult.title, testFileNode, testFilePath);
  const specNode = currentParentNode.addTestChild(testResult.title, 'test', testLocationPath);
  specNode.start();
  finishSpecNode(specNode, testResult);
}

function getFirstElement(array) {
  return Array.isArray(array) && array.length > 0 ? array[0] : null;
}

function finishSpecNode(specNode, testResult) {
  let failureMessage, failureStack, failureExpectedStr, failureActualStr;
  const failureDetails = getFirstElement(testResult.failureDetails);
  if (failureDetails != null) {
    const normalizedMessageAndStackObj = normalizeFailureMessageAndStack(failureDetails.message, failureDetails.stack);
    failureMessage = normalizedMessageAndStackObj.message;
    failureStack = normalizedMessageAndStackObj.stack;
    const matcherResult = failureDetails.matcherResult;
    if (matcherResult && matcherResult.expected !== matcherResult.actual) {
      failureExpectedStr = stringifier.stringify(matcherResult.expected);
      failureActualStr = stringifier.stringify(matcherResult.actual);
    }
  }
  if (!util.isString(failureMessage)) {
    if (testResult.status === 'todo') {
      failureMessage = `Todo '${specNode.name}'`;
    }
    else {
      const failureMessageAndStack = getFirstElement(testResult.failureMessages);
      if (failureMessageAndStack != null && util.isString(failureMessageAndStack)) {
        const messageAndStackObj = splitFailureMessageAndStack(failureMessageAndStack);
        failureMessage = messageAndStackObj.message;
        failureStack = messageAndStackObj.stack;
      }
    }
  }
  const outcome = getOutcome(testResult.status);
  if (outcome === Tree.TestOutcome.FAILED && !util.isString(failureMessage)) {
    failureMessage = 'Failure cause not provided'
  }
  specNode.setOutcome(outcome, testResult.duration, failureMessage, failureStack, failureExpectedStr, failureActualStr, null, null);
  if (util.isString(failureExpectedStr)) {
    specNode.setPrintExpectedAndActualValues(!containsExpectedAndActualValues(failureMessage));
  }
  specNode.finish(false);
}

function normalizeFailureMessageAndStack(message, stack) {
  if (util.isString(message) && util.isString(stack) && message.length > 0) {
    if (stack.indexOf(message) === 0) {
      stack = stack.substring(message.length);
    }
    else {
      const newMessage = "Error: " + message;
      if (stack.indexOf(newMessage) === 0) {
        stack = stack.substring(newMessage.length);
        message = newMessage;
      }
    }
  }
  return { stack: stack, message: message };
}

function splitFailureMessageAndStack(failureMessageAndStack) {
  const lines = splitByLines(failureMessageAndStack);
  let stackStartInd = lines.findIndex(line => line.match(/^\s+at\s.*\)$/));
  if (stackStartInd < 0) {
    stackStartInd = Math.min(1, lines.length);
  }
  return {
    message: lines.slice(0, stackStartInd).join('\n').trim(),
    stack: lines.slice(stackStartInd).join('\n')
  }
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
 * @param {string} status
 * @returns {TestOutcome}
 */
function getOutcome(status) {
  if (status === 'passed') {
    return Tree.TestOutcome.SUCCESS;
  }
  if (status === 'pending' || status === 'disabled') {
    return Tree.TestOutcome.SKIPPED;
  }
  if (status === 'todo') {
    return Tree.TestOutcome.SKIPPED;
  }
  return Tree.TestOutcome.FAILED;
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

function addErrorTestChild(parentNode, childName, failureMsg) {
  const errorNode = parentNode.addTestChild(childName, 'test', null);
  errorNode.setOutcome(Tree.TestOutcome.ERROR, null, failureMsg, null, null, null, null, null);
  errorNode.start();
  errorNode.finish(false);
}

function addEmptyTestResultIfNeeded(rootNode) {
  if (rootNode.children.every((child) => isCreatedState(child))) {
    addErrorTestChild(rootNode, 'No tests found', 'No matching tests found')
  }
}

function isCreatedState(node) {
  return node.state.name === 'created'
}

let globalRunScopeType;
function getRunScopeType() {
  if (globalRunScopeType == null) {
    globalRunScopeType = process.env['_JETBRAINS_TEST_RUNNER_RUN_SCOPE_TYPE'];
  }
  return globalRunScopeType;
}

function isSuitesOrTestsScope() {
  const runScopeType = getRunScopeType();
  return runScopeType === 'suite' || runScopeType === 'test' || runScopeType === 'selected_tests';
}

exports.addTestFileNode = addTestFileNode;
exports.reportTestFileResults = reportTestFileResults;
exports.reportSpecResult = reportSpecResult;
exports.warn = warn;
exports.safeFn = safeFn;
exports.getLocationPath = getLocationPath;
exports.addEmptyTestResultIfNeeded = addEmptyTestResultIfNeeded;
exports.isCreatedState = isCreatedState;

exports.createGlobals = function (originalSetupTestFrameworkScriptFile) {
  const globals = {};
  if (originalSetupTestFrameworkScriptFile) {
    globals._JB_INTELLIJ_ORIGINAL_SETUP_TEST_FRAMEWORK_SCRIPT_FILE = originalSetupTestFrameworkScriptFile;
  }
  return globals;
};
exports.getOriginalSetupTestFrameworkScriptFile = function () {
  if (typeof _JB_INTELLIJ_ORIGINAL_SETUP_TEST_FRAMEWORK_SCRIPT_FILE !== 'undefined') {
    return _JB_INTELLIJ_ORIGINAL_SETUP_TEST_FRAMEWORK_SCRIPT_FILE;
  }
};
exports.JASMINE_REPORTER_DISABLED = '_JB_INTELLIJ_JASMINE_REPORTER_DISABLED';

exports.isRunWithCoverage = () => {
  return process.env['_JETBRAINS_INTELLIJ_RUN_WITH_COVERAGE'] === 'true';
}

function splitByLines(text) {
  return text.split(/\n|\r\n/);
}

function containsExpectedAndActualValues(failureMessage) {
  if (util.isString(failureMessage)) {
    const lines = splitByLines(failureMessage)
    return lines.length >= 2 &&
           lines[lines.length - 2].startsWith('Expected:') &&
           lines[lines.length - 1].startsWith('Received:');
  }
  return false;
}

exports.containsExpectedAndActualValues = containsExpectedAndActualValues;
exports.normalizeFailureMessageAndStack = normalizeFailureMessageAndStack;
