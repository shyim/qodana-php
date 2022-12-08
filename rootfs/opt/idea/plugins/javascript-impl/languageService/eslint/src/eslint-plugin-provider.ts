import {EslintPluginState} from "./eslint-api"

class ESLintPluginFactory implements LanguagePluginFactory {
  create(state: EslintPluginState): { languagePlugin: LanguagePlugin; readyMessage?: any } {
    if (state.standardPackagePath == null) {
      let dotIndex = state.eslintPackageVersion.indexOf(".")
      let majorVersion = dotIndex > 0 ? state.eslintPackageVersion.substring(0, dotIndex) : "";
      if (+majorVersion >= 8) {
        const ESLint8Plugin = require('./eslint8-plugin').ESLint8Plugin;
        return {languagePlugin: new ESLint8Plugin(state)};
      }
    }

    const ESLintPlugin = require('./eslint-plugin').ESLintPlugin;
    return {languagePlugin: new ESLintPlugin(state)};
  }
}

let factory = new ESLintPluginFactory();

export {factory};