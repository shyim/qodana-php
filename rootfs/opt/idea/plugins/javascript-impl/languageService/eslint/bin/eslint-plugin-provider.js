"use strict";
exports.__esModule = true;
exports.factory = void 0;
var ESLintPluginFactory = /** @class */ (function () {
    function ESLintPluginFactory() {
    }
    ESLintPluginFactory.prototype.create = function (state) {
        if (state.standardPackagePath == null) {
            var dotIndex = state.eslintPackageVersion.indexOf(".");
            var majorVersion = dotIndex > 0 ? state.eslintPackageVersion.substring(0, dotIndex) : "";
            if (+majorVersion >= 8) {
                var ESLint8Plugin = require('./eslint8-plugin').ESLint8Plugin;
                return { languagePlugin: new ESLint8Plugin(state) };
            }
        }
        var ESLintPlugin = require('./eslint-plugin').ESLintPlugin;
        return { languagePlugin: new ESLintPlugin(state) };
    };
    return ESLintPluginFactory;
}());
var factory = new ESLintPluginFactory();
exports.factory = factory;
//# sourceMappingURL=eslint-plugin-provider.js.map