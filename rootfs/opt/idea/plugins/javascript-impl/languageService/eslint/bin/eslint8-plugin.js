"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ESLint8Plugin = void 0;
var eslint_api_1 = require("./eslint-api");
var eslint_common_1 = require("./eslint-common");
var ESLint8Plugin = /** @class */ (function () {
    function ESLint8Plugin(state) {
        this.includeSourceText = state.includeSourceText;
        this.additionalRulesDirectory = state.additionalRootDirectory;
        var eslintPackagePath = (0, eslint_common_1.normalizePath)(state.eslintPackagePath);
        this.ESLint = (0, eslint_common_1.requireInContext)(eslintPackagePath, state.packageJsonPath).ESLint;
        try {
            var apiJsPath = (0, eslint_common_1.requireResolveInContext)(eslintPackagePath, state.packageJsonPath);
            this.libOptions = (0, eslint_common_1.requireInContext)("../lib/options" /* path relative to eslint/lib/api.js */, apiJsPath);
        }
        catch (e) {
            this.libOptions = null;
        }
    }
    ESLint8Plugin.prototype.onMessage = function (p, writer) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, lintResults, lintResults, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = JSON.parse(p);
                        response = new eslint_api_1.ESLintResponse(request.seq, request.command);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!(request.command === ESLint8Plugin.GetErrors)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getErrors(request.arguments)];
                    case 2:
                        lintResults = _a.sent();
                        response.body = { results: this.filterSourceIfNeeded(lintResults) };
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(request.command === ESLint8Plugin.FixErrors)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.fixErrors(request.arguments)];
                    case 4:
                        lintResults = _a.sent();
                        response.body = { results: this.filterSourceIfNeeded(lintResults) };
                        return [3 /*break*/, 6];
                    case 5:
                        response.error = "Unknown command: ".concat(request.command);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        response.isNoConfigFile = "no-config-found" === e_1.messageTemplate
                            || (e_1.message && (0, eslint_common_1.containsString)(e_1.message.toString(), "No ESLint configuration found"));
                        response.error = e_1.toString() + "\n\n" + e_1.stack;
                        return [3 /*break*/, 8];
                    case 8:
                        writer.write(JSON.stringify(response));
                        return [2 /*return*/];
                }
            });
        });
    };
    ESLint8Plugin.prototype.filterSourceIfNeeded = function (results) {
        if (!this.includeSourceText) {
            results.forEach(function (value) {
                delete value.source;
                value.messages.forEach(function (msg) { return delete msg.source; });
            });
        }
        return results;
    };
    ESLint8Plugin.prototype.getErrors = function (getErrorsArguments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.invokeESLint(getErrorsArguments)];
            });
        });
    };
    ESLint8Plugin.prototype.fixErrors = function (fixErrorsArguments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.invokeESLint(fixErrorsArguments, { fix: true })];
            });
        });
    };
    ESLint8Plugin.prototype.invokeESLint = function (requestArguments, additionalOptions) {
        if (additionalOptions === void 0) { additionalOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var CLIOptions, parsedCommandLineOptions, options, eslint, config, plugins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        CLIOptions = this.libOptions instanceof Function
                            ? this.libOptions(false) // eslint 8.23+
                            : this.libOptions;
                        parsedCommandLineOptions = CLIOptions != null && CLIOptions.parse instanceof Function
                            ? translateOptions(CLIOptions.parse(requestArguments.extraOptions || ""))
                            : {};
                        options = __assign(__assign({}, parsedCommandLineOptions), additionalOptions);
                        options.ignorePath = requestArguments.ignoreFilePath;
                        if (requestArguments.configPath != null) {
                            options.overrideConfigFile = requestArguments.configPath;
                        }
                        if (this.additionalRulesDirectory != null && this.additionalRulesDirectory.length > 0) {
                            if (options.rulePaths == null) {
                                options.rulePaths = [this.additionalRulesDirectory];
                            }
                            else {
                                options.rulePaths.push(this.additionalRulesDirectory);
                            }
                        }
                        eslint = new this.ESLint(options);
                        if (!(requestArguments.fileKind === eslint_api_1.FileKind.html)) return [3 /*break*/, 2];
                        return [4 /*yield*/, eslint.calculateConfigForFile(requestArguments.fileName)];
                    case 1:
                        config = _a.sent();
                        plugins = config.plugins;
                        if (!Array.isArray(plugins) || !plugins.includes("html")) {
                            return [2 /*return*/, []];
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, eslint.isPathIgnored(requestArguments.fileName)];
                    case 3:
                        if (_a.sent()) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, eslint.lintText(requestArguments.content, { filePath: requestArguments.fileName })];
                }
            });
        });
    };
    ESLint8Plugin.GetErrors = "GetErrors";
    ESLint8Plugin.FixErrors = "FixErrors";
    return ESLint8Plugin;
}());
exports.ESLint8Plugin = ESLint8Plugin;
// See https://github.com/eslint/eslint/blob/f1b7499a5162d3be918328ce496eb80692353a5a/lib/cli.js#L62
/**
 * Translates the CLI options into the options expected by the CLIEngine.
 * @param {ParsedCLIOptions} cliOptions The CLI options to translate.
 * @returns {ESLintOptions} The options object for the CLIEngine.
 * @private
 */
function translateOptions(_a) {
    var cache = _a.cache, cacheFile = _a.cacheFile, cacheLocation = _a.cacheLocation, cacheStrategy = _a.cacheStrategy, config = _a.config, env = _a.env, errorOnUnmatchedPattern = _a.errorOnUnmatchedPattern, eslintrc = _a.eslintrc, ext = _a.ext, fix = _a.fix, fixDryRun = _a.fixDryRun, fixType = _a.fixType, global = _a.global, ignore = _a.ignore, ignorePath = _a.ignorePath, ignorePattern = _a.ignorePattern, inlineConfig = _a.inlineConfig, parser = _a.parser, parserOptions = _a.parserOptions, plugin = _a.plugin, quiet = _a.quiet, reportUnusedDisableDirectives = _a.reportUnusedDisableDirectives, resolvePluginsRelativeTo = _a.resolvePluginsRelativeTo, rule = _a.rule, rulesdir = _a.rulesdir;
    return {
        allowInlineConfig: inlineConfig,
        cache: cache,
        cacheLocation: cacheLocation || cacheFile,
        cacheStrategy: cacheStrategy,
        errorOnUnmatchedPattern: errorOnUnmatchedPattern,
        extensions: ext,
        // fix: (fix || fixDryRun) && (quiet ? quietFixPredicate : true),
        fixTypes: fixType,
        ignore: ignore,
        ignorePath: ignorePath,
        overrideConfig: {
            env: env && env.reduce(function (obj, name) {
                obj[name] = true;
                return obj;
            }, {}),
            globals: global && global.reduce(function (obj, name) {
                if (name.endsWith(":true")) {
                    obj[name.slice(0, -5)] = "writable";
                }
                else {
                    obj[name] = "readonly";
                }
                return obj;
            }, {}),
            ignorePatterns: ignorePattern,
            parser: parser,
            parserOptions: parserOptions,
            plugins: plugin,
            rules: rule
        },
        overrideConfigFile: config,
        reportUnusedDisableDirectives: reportUnusedDisableDirectives ? "error" : void 0,
        resolvePluginsRelativeTo: resolvePluginsRelativeTo,
        rulePaths: rulesdir,
        useEslintrc: eslintrc
    };
}
//# sourceMappingURL=eslint8-plugin.js.map