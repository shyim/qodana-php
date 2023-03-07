const path = require('path')
    , processStdoutWrite = process.stdout.write.bind(process.stdout)
    , processStderrWrite = process.stderr.write.bind(process.stderr)
    , MOCHA = 'mocha';

var doEscapeCharCode = (function () {
  var obj = {};

  function addMapping(fromChar, toChar) {
    if (fromChar.length !== 1 || toChar.length !== 1) {
      throw Error('String length should be 1');
    }
    var fromCharCode = fromChar.charCodeAt(0);
    if (typeof obj[fromCharCode] === 'undefined') {
      obj[fromCharCode] = toChar;
    }
    else {
      throw Error('Bad mapping');
    }
  }

  addMapping('\n', 'n');
  addMapping('\r', 'r');
  addMapping('\u0085', 'x');
  addMapping('\u2028', 'l');
  addMapping('\u2029', 'p');
  addMapping('|', '|');
  addMapping('\'', '\'');
  addMapping('[', '[');
  addMapping(']', ']');

  return function (charCode) {
    return obj[charCode];
  };
}());

function isAttributeValueEscapingNeeded(str) {
  var len = str.length;
  for (var i = 0; i < len; i++) {
    if (doEscapeCharCode(str.charCodeAt(i))) {
      return true;
    }
  }
  return false;
}

function escapeAttributeValue(str) {
  if (!isAttributeValueEscapingNeeded(str)) {
    return str;
  }
  var res = ''
    , len = str.length;
  for (var i = 0; i < len; i++) {
    var escaped = doEscapeCharCode(str.charCodeAt(i));
    if (escaped) {
      res += '|';
      res += escaped;
    }
    else {
      res += str.charAt(i);
    }
  }
  return res;
}

/**
 * @param {Array.<string>} list
 * @param {number} fromInclusive
 * @param {number} toExclusive
 * @param {string} delimiterChar one character string
 * @returns {string}
 */
function joinList(list, fromInclusive, toExclusive, delimiterChar) {
  if (list.length === 0) {
    return '';
  }
  if (delimiterChar.length !== 1) {
    throw Error('Delimiter is expected to be a character, but "' + delimiterChar + '" received');
  }
  var addDelimiter = false
    , escapeChar = '\\'
    , escapeCharCode = escapeChar.charCodeAt(0)
    , delimiterCharCode = delimiterChar.charCodeAt(0)
    , result = ''
    , item
    , itemLength
    , ch
    , chCode;
  for (var itemId = fromInclusive; itemId < toExclusive; itemId++) {
    if (addDelimiter) {
      result += delimiterChar;
    }
    addDelimiter = true;
    item = list[itemId];
    itemLength = item.length;
    for (var i = 0; i < itemLength; i++) {
      ch = item.charAt(i);
      chCode = item.charCodeAt(i);
      if (chCode === delimiterCharCode || chCode === escapeCharCode) {
        result += escapeChar;
      }
      result += ch;
    }
  }
  return result;
}

var toString = {}.toString;

/**
 * @param {*} value
 * @return {boolean}
 */
function isString(value) {
  return isStringPrimitive(value) || toString.call(value) === '[object String]';
}

/**
 * @param {*} value
 * @return {boolean}
 */
function isStringPrimitive(value) {
  return typeof value === 'string';
}

function safeFn(fn) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (ex) {
      const message = ex.message || '';
      const stack = ex.stack || '';
      warn(stack.indexOf(message) >= 0 ? stack : message + '\n' + stack);
    }
  };
}

function warn(...args) {
  const util = require('util');
  const str = 'warn mocha-intellij: ' + util.format.apply(util, args) + '\n';
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

function writeToStdout(str) {
  processStdoutWrite(str);
}

function writeToStderr(str) {
  processStderrWrite(str);
}

/**
 * Requires inner mocha module.
 *
 * @param {string} mochaModuleRelativePath  Path to inner mocha module relative to mocha package root directory,
 *                                e.g. <code>"./lib/utils"</code> or <code>"./lib/reporters/base.js"</code>
 * @returns {*} loaded module
 */
function requireMochaModule(mochaModuleRelativePath) {
  const mainFile = require.main.filename;
  const packageDir = findPackageDir(mainFile);
  if (packageDir == null) {
    throw Error('mocha-intellij: cannot require "' + mochaModuleRelativePath +
        '": unable to find package root for "' + mainFile + '"');
  }
  const mochaModulePath = path.join(packageDir, mochaModuleRelativePath);
  if (path.basename(packageDir) === MOCHA) {
    return requireInContext(mochaModulePath);
  }
  try {
    return requireInContext(mochaModulePath);
  }
  catch (e) {
    const mochaPackageDir = findMochaInnerDependency(packageDir);
    if (mochaPackageDir == null) {
      throw Error('mocha-intellij: cannot require "' + mochaModuleRelativePath +
          '": not found mocha dependency for "' + packageDir + '"');
    }
    return requireInContext(path.join(mochaPackageDir, mochaModuleRelativePath));
  }
}

function requireInContext(modulePathToRequire) {
  const contextRequire = getContextRequire(modulePathToRequire);
  return contextRequire(modulePathToRequire);
}

function getContextRequire(modulePathToRequire) {
  const m = require('module');
  if (typeof m.createRequire === 'function') {
    // https://nodejs.org/api/modules.html#modules_module_createrequire_filename
    // Also, implemented for Yarn Pnp: https://next.yarnpkg.com/advanced/pnpapi/#requiremodule
    return m.createRequire(process.cwd());
  }
  return require;
}

function toUnixPath(path) {
  return path.split("\\").join("/");
}

function findMochaInnerDependency(packageDir) {
  let mochaMainFilePath = require.resolve("mocha", { paths: [packageDir] });
  mochaMainFilePath = toUnixPath(mochaMainFilePath);
  const sepMochaSep = "/mocha/";
  const ind = mochaMainFilePath.lastIndexOf(sepMochaSep);
  if (ind < 0) {
    throw Error("Cannot find mocha package for " + packageDir);
  }
  return mochaMainFilePath.substring(0, ind + sepMochaSep.length - 1);
}

/**
 * Find package's root directory traversing the file system up.
 *
 * @param   {string} startDir Starting directory or file located in the package
 * @returns {?string}         The package's root directory, or null if not found
 */
function findPackageDir(startDir) {
  let dir = startDir;
  while (dir != null) {
    if (path.basename(dir) === 'node_modules') {
      break;
    }
    try {
      const packageJson = path.join(dir, 'package.json');
      require.resolve(packageJson, {paths: [process.cwd()]});
      return dir;
    } catch (e) {
    }
    const parent = path.dirname(dir);
    if (dir === parent) {
      break;
    }
    dir = parent;
  }
  return null;
}

/**
 * It's suggested that every Mocha reporter should inherit from Mocha Base reporter.
 * See https://github.com/mochajs/mocha/blob/master/lib/reporters/base.js
 *
 * At least Base reporter is needed to add and update IntellijReporter.stats object that is used by growl reporter.
 * @returns {?function}  The base reporter, or undefined if not found
 */
function requireBaseReporter() {
  const baseReporterPath = './lib/reporters/base.js';
  try {
    const Base = requireMochaModule(baseReporterPath);
    if (typeof Base === 'function') {
      return Base;
    }
    warn('base reporter (' + baseReporterPath + ') is not a function');
  } catch (e) {
    warn('cannot load base reporter from "' + baseReporterPath + '". ', e);
  }
}

let mochaUtilsCache;

function requireMochaUtils() {
  if (mochaUtilsCache !== undefined) {
    return mochaUtilsCache;
  }
  const mochaUtilsRelativePath = './lib/utils';
  try {
    const mochaUtils = requireMochaModule(mochaUtilsRelativePath);
    mochaUtilsCache = mochaUtils;
    return mochaUtils;
  } catch (e) {
    warn('cannot load "' + mochaUtilsRelativePath + '". Caused by ', e);
    mochaUtilsCache = null;
  }
}

exports.escapeAttributeValue = escapeAttributeValue;
exports.joinList = joinList;
exports.isString = isString;
exports.isStringPrimitive = isStringPrimitive;
exports.safeFn = safeFn;
exports.writeToStdout = writeToStdout;
exports.writeToStderr = writeToStderr;
exports.requireMochaUtils = requireMochaUtils;
exports.requireBaseReporter = requireBaseReporter;
