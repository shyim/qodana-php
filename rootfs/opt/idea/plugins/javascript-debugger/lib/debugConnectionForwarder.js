const JB_FORWARDED_DEBUG_PORT = '_JB_FORWARDED_DEBUG_PORT';

if (process.env[JB_FORWARDED_DEBUG_PORT] != null) {
  doForwardDebugConnection(parseInt(process.env[JB_FORWARDED_DEBUG_PORT]));
  return;
}

function doForwardDebugConnection(debugPort) {
  if (debugPort <= 0 || isNaN(debugPort)) {
    console.error(formatMessage('undefined debugPort'));
    return;
  }
  const gatewayHostPort = getGatewayHostPort();
  if (gatewayHostPort == null) {
    console.error(formatMessage('undefined gateway'));
    return;
  }
  const inspectorHostPort = {port: debugPort};
  const verboseLogging = isVerboseLoggingEnabled();
  if (verboseLogging) {
    console.log(formatMessage('Forwarding connection between inspector ' + JSON.stringify(inspectorHostPort) +
      ' and gateway ' + JSON.stringify(gatewayHostPort)));
  }

  const gatewaySocket = connect(gatewayHostPort, 'gateway', verboseLogging);
  const inspectorSocket = connect(inspectorHostPort, 'inspector', verboseLogging);

  gatewaySocket.pipe(inspectorSocket);
  inspectorSocket.pipe(gatewaySocket);
}

function connect(options, endpointName, verboseLogging) {
  const net = require('net');
  const socket = net.createConnection(options);
  socket.setNoDelay(true);
  socket.on('error', err => {
    console.error(formatMessage('Error connecting to ' + endpointName + ' ' + JSON.stringify(options)), err);
  });
  if (verboseLogging) {
    logEvent(socket, 'lookup', endpointName);
    logEvent(socket, 'connect', endpointName);
    logEvent(socket, 'ready', endpointName);
    socket.once('data', (data) => {
      console.log(formatMessage('received data from ' + endpointName + ' (' + data.length + ' bytes)'));
    });
    logEvent(socket, 'timeout', endpointName);
    logEvent(socket, 'close', endpointName);
    logEvent(socket, 'end', endpointName);
  }
  return socket;
}

function logEvent(socket, eventName, socketName, logEventArgs) {
  socket.on(eventName, () => {
    console.log(formatMessage('\'' + eventName + '\' event from ' + socketName +
      (logEventArgs ? ', args: ' + JSON.stringify(arguments) : '')));
  });
}

function formatMessage(message) {
  return '[debugConnectionForwarder pid:' + process.pid + '] ' + message;
}

function getGatewayHostPort() {
  const host = process.env.JB_NODE_DEBUG_CONNECTION_GATEWAY_HOST
  const port = parseInt(process.env.JB_NODE_DEBUG_CONNECTION_GATEWAY_PORT)
  if (host != null && port > 0 && !isNaN(port)) {
    return {host: host, port: port};
  }
  return null;
}

exports.shouldForwardDebugConnection = () => {
  return getGatewayHostPort() != null;
};

exports.forwardDebugConnectionAndWait = (debugPort) => {
  require('child_process').spawn(process.env['JB_INTERPRETER'] || process.execPath, [__filename], {
    env: Object.assign({}, process.env, {
      [JB_FORWARDED_DEBUG_PORT]: debugPort,
      NODE_OPTIONS: ''
    }),
    stdio: 'inherit'
  });

  const inspector = require('inspector');
  if (typeof inspector.waitForDebugger === 'function') {
    inspector.waitForDebugger();
  }
  else {
    console.error('[debugConnectionForwarder] inspector.waitForDebugger is unavailable in ' + process.versions.node +
      ". Some initial breakpoints might be skipped.")
  }
};


function isVerboseLoggingEnabled() {
  return process.env.JB_NODE_DEBUGGER_ENABLE_VERBOSE_LOGGING != null;
}
