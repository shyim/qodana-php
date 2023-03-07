const JB_NODE_DEBUGGER_ATTACH_TO_KNOWN_HELPERS = 'JB_NODE_DEBUGGER_ATTACH_TO_KNOWN_HELPERS';
const INTERPRETER_DIR_MACRO = '[interpreter dir]';

try {
  if (process.env.PORT_PUBLISHER) {
    publishDebugPort()
    return;
  }

  if (hasInspectArg()) {
    return;
  }

  if (isElectronRendererProcess()) {
    return;
  }

  if (isKnownHelperProcess()) {
    return;
  }
  try {
    if (!require('worker_threads').isMainThread) {
      // will be attached using WIP NodeWorker domain
      return;
    }
  }
  catch (ignored) {
  }
  let asyncInspectorOpenSupported = isAsyncInspectorOpenSupported();

  let inspector = require("inspector");
  const debugConnectionForwarder = require('./debugConnectionForwarder');
  const {execFile, execFileSync} = require('child_process');
  let port = findAvailablePort(inspector);
  if (debugConnectionForwarder.shouldForwardDebugConnection()) {
    debugConnectionForwarder.forwardDebugConnectionAndWait(port);
    return;
  }

  let launchPortPublisher = asyncInspectorOpenSupported ? execFileSync : execFile;
  const interpreter = process.env["JB_INTERPRETER"] || process.execPath;
  let publisherEnv = Object.assign({}, process.env, {
    PORT_PUBLISHER: true,
    JB_IDE_PORT: process.env["JB_IDE_PORT"],
    JB_IDE_HOST: process.env["JB_IDE_HOST"],
    JB_DEBUG_PORT: port,
    NODE_OPTIONS: ''
  });
  launchPortPublisher(interpreter, [__filename], {
    env: publisherEnv,
    stdio: 'inherit'
  });
  if (!asyncInspectorOpenSupported) {
    inspector.open(port, getBindHost(), true);
  }

}
catch (e) {
  console.error("Error in JetBrains node debug connector: ", e)
}

function publishDebugPort() {
  let idePort = process.env["JB_IDE_PORT"];
  let ideHost = process.env["JB_IDE_HOST"] || '127.0.0.1';
  let debugPort = process.env["JB_DEBUG_PORT"];

  const net = require('net');
  const TIMEOUT = 15000;
  const socket = net.createConnection({host: ideHost, port: idePort}, () => {
    socket.on('data', (d) => {
      clearTimeout(timeoutId);
      socket.destroy();
    });

    socket.write(debugPort, "utf8");
    const timeoutId = setTimeout(() => {
      process.stderr.write("Debugger didn't connect during timeout\n")
      return socket.destroy();
    }, TIMEOUT);
  });
  socket.setNoDelay(true);
  socket.on('error', err => {
    console.error("Error in debuggerConnector: " + err.message + "\n" + err.stack);
    if (process.env.JB_WSL_MSG) {
      console.error("\n" + process.env.JB_WSL_MSG +"\n")
    }
    process.exit(0);
  });
}

function hasInspectArg() {
  return process.execArgv.find(
      arg => arg === "--inspect" || arg === "--inspect-brk" || arg.startsWith("--inspect-brk=") || arg.startsWith("--inspect=")
  );
}

function isElectronRendererProcess() {
  return process.type && process.type === "renderer" ||
         process.argv.indexOf("--type=renderer") >= 0;
}

/**
 * Helper processes are Node.js processes that are known not to run application code,
 * so it's safe not to attach a debugger to them.
 *
 * Benefits of skipping attaching debugger to helper processes:
 * 1. Less debugger related output in the console. Several lines are printed in the console each time debugger is attached.
 * 2. Workaround for a more serious problem:
 *    Attaching debugger to short-living Node.js processes could terminate whole process tree (WEB-55884, WEB-56885).
 *    See org.jetbrains.debugger.connection.VmConnection#close.
 * @returns {boolean} true if the current process is a helper process
 */
function isKnownHelperProcess() {
  if (process.env[JB_NODE_DEBUGGER_ATTACH_TO_KNOWN_HELPERS]) {
    return false
  }
  const helperProcessInfoList = [
    ['/node_modules/npm/bin/npm-cli.js', 'prefix', '-g'], // "npm prefix -g" is run by npm.cmd on Windows
    ['/node_modules/update-notifier/check.js'], // check for npm/yarn available updates

    // npm/Yarn script (e.g. "npm run start") spawns the process hierarchy,
    // where the root Node.js process doesn't run application code
    ['/node_modules/npm/bin/npm-cli.js', 'run'],
    [INTERPRETER_DIR_MACRO + '/npm', 'run'], // ~/.nvm/versions/node/v18.12.1/bin/npm ('npm' and 'node' are the same folder)
    ['/Yarn/bin/yarn.js', 'run'],
    ['/usr/local/bin/npm', 'run']
  ]
  return helperProcessInfoList.some((helperProcessInfo) => {
    const matched = isHelperInfoMatched(helperProcessInfo)
    if (isVerboseLoggingEnabled()) {
      if (matched) {
        logMessage('Skipping attaching debugger to ' + process.argv + ' as it is matched as a helper process ' + helperProcessInfo
                     + '. Set ' + JB_NODE_DEBUGGER_ATTACH_TO_KNOWN_HELPERS + '=1 environment variable to force attaching debugger to it.')
      }
      else {
        logMessage(process.argv + ' is not matched as a helper process ' + helperProcessInfo)
      }
    }
    return matched
  })
}

function isHelperInfoMatched(helperProcessInfo) {
  const argv = process.argv;
  if (argv.length <= helperProcessInfo.length || helperProcessInfo.length === 0) {
    return false;
  }
  if (!matchPathSuffix(helperProcessInfo[0], argv[1])) {
    return false;
  }
  for (let i = 1; i < helperProcessInfo.length; i++) {
    if (helperProcessInfo[i] !== argv[i + 1]) {
      return false;
    }
  }
  return true;
}

function matchPathSuffix(pathSuffix, path) {
  if (pathSuffix.startsWith(INTERPRETER_DIR_MACRO)) {
    const expectedPath = require('path').dirname(process.execPath) + pathSuffix.substring(INTERPRETER_DIR_MACRO.length);
    return toSystemIndependentPath(path) === toSystemIndependentPath(expectedPath);
  }
  return toSystemIndependentPath(path).endsWith(pathSuffix);
}

function toSystemIndependentPath(path ) {
  return path.replace(/\\/g, '/');
}

/**
 * inspector.open(...,...,false) doesn't work properly on some node versions. It opens the port but debugger can't attach.
 */
function isAsyncInspectorOpenSupported() {
  try {
    let versions = process.versions.node.split(".");
    let major = parseInt(versions[0]);
    let minor = parseInt(versions[1]);
    let asyncInspectorOpenSupported = major >= 11 || (major === 10 && minor >= 7);
    return asyncInspectorOpenSupported;
  }
  catch (e) {
    process.stderr.write("Cannot parse node version: " + process.versions.node + "\n" + e.message);
    return false;
  }
}

function findAvailablePort(inspector) {
  try {
    let closeAuxiliaryInspector = !isAsyncInspectorOpenSupported();
    if (closeAuxiliaryInspector) {
      process.stderr.write("[IntelliJ is searching for port] ")
    }

    inspector.open(0, getBindHost(), false);
    let url = inspector.url();
    let schemeSeparatorIndex = url.indexOf("://");
    let slashIndex = url.indexOf("/", schemeSeparatorIndex + 3);
    let colonIndex = url.substr(0, slashIndex).lastIndexOf(":");
    let portString = url.substr(colonIndex + 1, slashIndex - colonIndex - 1);
    let port = Number(portString);
    if (!port) throw Error("failed to parse " + url);

    if (closeAuxiliaryInspector) {
      inspector.close()
    }

    return port;
  }
  catch(e) {
    inspector.close();
    throw e;
  }
}

/**
 * @return host to listen on for inspector connections. If undefined, localhost will be used.
 */
function getBindHost() {
  return process.env.JETBRAINS_NODE_BIND_HOST;
}

function isVerboseLoggingEnabled() {
  return process.env.JB_NODE_DEBUGGER_ENABLE_VERBOSE_LOGGING != null;
}

function logMessage(message) {
  console.log('[debugConnector pid:' + process.pid + '] ' + message);
}
