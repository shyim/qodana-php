"use strict";
/**
 * Entry point for the TypeScript plugin
 */
exports.__esModule = true;
exports.factory = exports.TypeScriptLanguagePluginFactory = exports.TypeScriptLanguagePlugin = void 0;
var service_loader_1 = require("./service-loader");
var logger_impl_1 = require("./logger-impl");
var ts_session_provider_1 = require("./ts-session-provider");
var ts_default_options_1 = require("./ts-default-options");
var ide_watcher_1 = require("./ide-watcher");
var util_1 = require("./util");
var TypeScriptLanguagePlugin = /** @class */ (function () {
    function TypeScriptLanguagePlugin(state) {
        var serviceInfo = (0, service_loader_1.getService)(state);
        var ts_impl = serviceInfo.ts;
        var serverFilePath = serviceInfo.serverFilePath;
        var version = ts_impl.version;
        var versionNumbers = (0, util_1.parseNumbersInVersion)(version);
        if ((0, util_1.isVersionMoreOrEqual)(versionNumbers, 5)) {
            var serviceInfo_1 = (0, service_loader_1.getService)(state, true);
            ts_impl = serviceInfo_1.ts;
            TypeScriptLanguagePlugin.setLocale(this.getDefaultCommandLineOptions(state, ts_impl), ts_impl);
        }
        else {
            (0, logger_impl_1.serverLogger)("Service context " + serviceInfo.serverFilePath, true);
            this.overrideSysDefaults(ts_impl, state, serverFilePath);
            var defaultOptionsHolder = this.getDefaultCommandLineOptions(state, ts_impl);
            TypeScriptLanguagePlugin.setLocale(defaultOptionsHolder, ts_impl);
            var loggerImpl = (0, logger_impl_1.createLoggerFromEnv)(ts_impl);
            this._session = this.getSession(ts_impl, loggerImpl, defaultOptionsHolder);
        }
        this.readyMessage = { version: ts_impl.version };
    }
    /**
     * if hasManualParams returns '{}' or parsed options
     * {} is a flag for skipping 'Cannot find parent tsconfig.json' notification
     * otherwise returns 'null' or parsed options
     */
    TypeScriptLanguagePlugin.prototype.getDefaultCommandLineOptions = function (state, ts_impl) {
        var commonDefaultCommandLine = state.commandLineArguments && state.commandLineArguments.length > 0 ?
            ts_impl.parseCommandLine(state.commandLineArguments) :
            null;
        var commonDefaultOptions = null;
        if (commonDefaultCommandLine && commonDefaultCommandLine.options) {
            commonDefaultOptions = commonDefaultCommandLine.options;
        }
        if (commonDefaultOptions === null && state.hasManualParams) {
            commonDefaultOptions = {};
        }
        var isUseSingleInferredProject = state.isUseSingleInferredProject;
        return new ts_default_options_1.DefaultOptionsHolder(commonDefaultOptions, ts_impl, state);
    };
    TypeScriptLanguagePlugin.setLocale = function (defaultOptionsHolder, ts_impl) {
        var _a;
        if (((_a = defaultOptionsHolder.options) === null || _a === void 0 ? void 0 : _a.locale) && typeof ts_impl.validateLocaleAndSetLanguage === "function") {
            ts_impl.validateLocaleAndSetLanguage(defaultOptionsHolder.options.locale, ts_impl.sys);
        }
    };
    TypeScriptLanguagePlugin.prototype.overrideSysDefaults = function (ts_impl, state, serverFile) {
        var pending = [];
        var canWrite = true;
        function writeMessage(s) {
            if (!canWrite) {
                pending.push(s);
            }
            else {
                canWrite = false;
                process.stdout.write(new Buffer(s, "utf8"), setCanWriteFlagAndWriteMessageIfNecessary);
            }
        }
        function setCanWriteFlagAndWriteMessageIfNecessary() {
            canWrite = true;
            if (pending.length) {
                writeMessage(pending.shift());
            }
        }
        // Override sys.write because fs.writeSync is not reliable on Node 4
        ts_impl.sys.write = function (s) { return writeMessage(s); };
        //ts 2.0 compatibility
        ts_impl.sys.setTimeout = setTimeout;
        ts_impl.sys.clearTimeout = clearTimeout;
        //ts2.0.5 & 2.1
        ts_impl.sys.setImmediate = setImmediate;
        ts_impl.sys.clearImmediate = clearImmediate;
        if (typeof global !== "undefined" && global.gc) {
            ts_impl.sys.gc = function () { return global.gc(); };
        }
        ts_impl.sys.getExecutingFilePath = function () {
            return serverFile;
        };
        var pollingWatchedFileSet = (0, ide_watcher_1.createPollingWatchedFileSet)(ts_impl, ts_impl.sys);
        ts_impl.sys.watchFile = function (fileName, callback) {
            var watchedFile = pollingWatchedFileSet.addFile(fileName, callback);
            return {
                close: function () { return pollingWatchedFileSet.removeFile(watchedFile); }
            };
        };
        ts_impl.sys.require = function (initialDir, moduleName) {
            try {
                var path = void 0;
                if (ts_impl.resolveJavaScriptModule) {
                    path = ts_impl.resolveJavaScriptModule(moduleName, initialDir, ts_impl.sys);
                }
                else {
                    path = initialDir + "/" + moduleName;
                }
                if (logger_impl_1.isLogEnabled) {
                    (0, logger_impl_1.serverLogger)("Resolving plugin with path " + path);
                }
                return {
                    module: require(path),
                    error: undefined
                };
            }
            catch (error) {
                (0, logger_impl_1.serverLogger)("Error while resolving plugin " + error);
                return { module: undefined, error: error };
            }
        };
        if (typeof ts_impl.server.CommandNames === "undefined") {
            //in ts2.4 names were migrated to types
            ts_impl.server.CommandNames = ts_impl.server.protocol.CommandTypes;
        }
    };
    TypeScriptLanguagePlugin.prototype.getSession = function (ts_impl, loggerImpl, defaultOptionsHolder) {
        var sessionClass = this.createSessionClass(ts_impl, defaultOptionsHolder);
        return this.instantiateSession(ts_impl, loggerImpl, defaultOptionsHolder, sessionClass);
    };
    TypeScriptLanguagePlugin.prototype.instantiateSession = function (ts_impl, loggerImpl, defaultOptionsHolder, sessionClass) {
        return (0, ts_session_provider_1.instantiateSession)(ts_impl, loggerImpl, defaultOptionsHolder, sessionClass);
    };
    TypeScriptLanguagePlugin.prototype.createSessionClass = function (ts_impl, defaultOptionsHolder) {
        return (0, ts_session_provider_1.createSessionClass)(ts_impl, defaultOptionsHolder);
    };
    TypeScriptLanguagePlugin.prototype.onMessage = function (p, writer) {
        if (this._session) {
            this._session.onMessage(p);
        }
    };
    return TypeScriptLanguagePlugin;
}());
exports.TypeScriptLanguagePlugin = TypeScriptLanguagePlugin;
var TypeScriptLanguagePluginFactory = /** @class */ (function () {
    function TypeScriptLanguagePluginFactory() {
    }
    TypeScriptLanguagePluginFactory.prototype.create = function (state) {
        var typeScriptLanguagePlugin = new TypeScriptLanguagePlugin(state);
        return {
            languagePlugin: typeScriptLanguagePlugin,
            readyMessage: typeScriptLanguagePlugin.readyMessage
        };
    };
    return TypeScriptLanguagePluginFactory;
}());
exports.TypeScriptLanguagePluginFactory = TypeScriptLanguagePluginFactory;
var factory = new TypeScriptLanguagePluginFactory();
exports.factory = factory;
