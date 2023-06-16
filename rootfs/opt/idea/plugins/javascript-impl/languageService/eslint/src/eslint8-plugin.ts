import {EslintPluginState, ESLintRequest, ESLintResponse, FileKind, RequestArguments, FixErrors, GetErrors} from "./eslint-api"
import {containsString, normalizePath, requireInContext, requireResolveInContext} from "./eslint-common"

export class ESLint8Plugin implements LanguagePlugin {
  private readonly includeSourceText: boolean | null;
  private readonly additionalRulesDirectory?: string;
  private readonly ESLint: any;
  private readonly FlatESLint: any;
  private readonly libOptions: any;

  constructor(state: EslintPluginState) {
    this.includeSourceText = state.includeSourceText;
    this.additionalRulesDirectory = state.additionalRootDirectory;

    let eslintPackagePath = normalizePath(state.eslintPackagePath);
    this.ESLint = requireInContext(eslintPackagePath, state.packageJsonPath).ESLint;

    try {
      const apiJsPath = requireResolveInContext(eslintPackagePath, state.packageJsonPath);

      try {
        this.libOptions = requireInContext("../lib/options" /* path relative to eslint/lib/api.js */, apiJsPath);
      }
      catch (e) {
        this.libOptions = null;
      }

      try {
        this.FlatESLint = requireInContext("../lib/unsupported-api", apiJsPath).FlatESLint;
      }
      catch (e) {
        this.FlatESLint = null;
      }
    }
    catch (e) {
      this.libOptions = null;
      this.FlatESLint = null;
    }
  }

  async onMessage(p: string, writer: MessageWriter) {
    const request: ESLintRequest = JSON.parse(p);
    let response: ESLintResponse = new ESLintResponse(request.seq, request.command);
    try {
      if (request.command === GetErrors) {
        let lintResults: ESLint.LintResult[] = await this.getErrors(request.arguments);
        response.body = {results: this.filterSourceIfNeeded(lintResults)};
      }
      else if (request.command === FixErrors) {
        let lintResults: ESLint.LintResult[] = await this.fixErrors(request.arguments);
        response.body = {results: this.filterSourceIfNeeded(lintResults)};
      }
      else {
        response.error = `Unknown command: ${request.command}`
      }
    }
    catch (e) {
      response.isNoConfigFile = "no-config-found" === e.messageTemplate
        || (e.message && containsString(e.message.toString(), "No ESLint configuration found"));
      response.error = e.toString() + "\n\n" + e.stack;
    }
    writer.write(JSON.stringify(response));
  }

  private filterSourceIfNeeded(results: ESLint.LintResult[]): ESLint.LintResult[] {
    if (!this.includeSourceText) {
      results.forEach(value => {
        delete value.source
        value.messages.forEach(msg => delete msg.source)
      })
    }
    return results
  }

  private async getErrors(getErrorsArguments: RequestArguments): Promise<ESLint.LintResult[]> {
    return this.invokeESLint(getErrorsArguments)
  }

  private async fixErrors(fixErrorsArguments: RequestArguments): Promise<ESLint.LintResult[]> {
    return this.invokeESLint(fixErrorsArguments, {fix: true})
  }

  private async invokeESLint(requestArguments: RequestArguments, additionalOptions: ESLint.Options = {}): Promise<ESLint.LintResult[]> {
    const usingFlatConfig = requestArguments.flatConfig && this.FlatESLint instanceof Function;

    const CLIOptions =
      this.libOptions instanceof Function
        ? this.libOptions(usingFlatConfig) // eslint 8.23+
        : this.libOptions;

    const parsedCommandLineOptions =
      CLIOptions != null && CLIOptions.parse instanceof Function
        ? translateOptions(CLIOptions.parse(requestArguments.extraOptions || ""), usingFlatConfig ? "flat" : "eslintrc")
        : {}

    const options: ESLint.Options = {...parsedCommandLineOptions, ...additionalOptions};

    if (!usingFlatConfig) {
      options.ignorePath = requestArguments.ignoreFilePath;
    }

    if (requestArguments.configPath != null) {
      options.overrideConfigFile = requestArguments.configPath;
    }

    if (this.additionalRulesDirectory != null && this.additionalRulesDirectory.length > 0) {
      if (options.rulePaths == null) {
        options.rulePaths = [this.additionalRulesDirectory]
      }
      else {
        options.rulePaths.push(this.additionalRulesDirectory);
      }
    }

    const eslint = usingFlatConfig ? new this.FlatESLint(options) : new this.ESLint(options);

    if (requestArguments.fileKind === FileKind.html) {
      const config: any = await eslint.calculateConfigForFile(requestArguments.fileName);
      const plugins: string[] | null | undefined = config.plugins;

      if (!Array.isArray(plugins) || !plugins.includes("html")) {
        return [];
      }
    }

    if (await eslint.isPathIgnored(requestArguments.fileName)) {
      return [];
    }

    return eslint.lintText(requestArguments.content, {filePath: requestArguments.fileName});
  }
}


// See https://github.com/eslint/eslint/blob/740b20826fadc5322ea5547c1ba41793944e571d/lib/cli.js#L69
/**
 * Translates the CLI options into the options expected by the ESLint constructor.
 * @param {ParsedCLIOptions} cliOptions The CLI options to translate.
 * @param {"flat"|"eslintrc"} [configType="eslintrc"] The format of the
 *      config to generate.
 * @returns {Promise<ESLintOptions>} The options object for the ESLint constructor.
 * @private
 */
/*async*/ function translateOptions({
                                      cache,
                                      cacheFile,
                                      cacheLocation,
                                      cacheStrategy,
                                      config,
                                      configLookup,
                                      env,
                                      errorOnUnmatchedPattern,
                                      eslintrc,
                                      ext,
                                      fix,
                                      fixDryRun,
                                      fixType,
                                      global,
                                      ignore,
                                      ignorePath,
                                      ignorePattern,
                                      inlineConfig,
                                      parser,
                                      parserOptions,
                                      plugin,
                                      quiet,
                                      reportUnusedDisableDirectives,
                                      resolvePluginsRelativeTo,
                                      rule,
                                      rulesdir
                                }, configType) {

  let overrideConfig, overrideConfigFile;
  /*
  const importer = new ModuleImporter();
  */

  if (configType === "flat") {
    overrideConfigFile = (typeof config === "string") ? config : !configLookup;
    if (overrideConfigFile === false) {
      overrideConfigFile = void 0;
    }

    let globals = {};

    if (global) {
      globals = global.reduce((obj, name) => {
        if (name.endsWith(":true")) {
          obj[name.slice(0, -5)] = "writable";
        } else {
          obj[name] = "readonly";
        }
        return obj;
      }, globals);
    }

    overrideConfig = [{
      languageOptions: {
        globals,
        parserOptions: parserOptions || {}
      },
      rules: rule ? rule : {}
    }];

    /*
    if (parser) {
      overrideConfig[0].languageOptions.parser = await importer.import(parser);
    }

    if (plugin) {
      const plugins = {};

      for (const pluginName of plugin) {

        const shortName = naming.getShorthandName(pluginName, "eslint-plugin");
        const longName = naming.normalizePackageName(pluginName, "eslint-plugin");

        plugins[shortName] = await importer.import(longName);
      }

      overrideConfig[0].plugins = plugins;
    }
    */

  } else {
    overrideConfigFile = config;

    overrideConfig = {
      env: env && env.reduce((obj, name) => {
        obj[name] = true;
        return obj;
      }, {}),
      globals: global && global.reduce((obj, name) => {
        if (name.endsWith(":true")) {
          obj[name.slice(0, -5)] = "writable";
        } else {
          obj[name] = "readonly";
        }
        return obj;
      }, {}),
      ignorePatterns: ignorePattern,
      parser,
      parserOptions,
      plugins: plugin,
      rules: rule
    };
  }

  const options = {
    allowInlineConfig: inlineConfig,
    cache,
    cacheLocation: cacheLocation || cacheFile,
    cacheStrategy,
    errorOnUnmatchedPattern,
    /*
    fix: (fix || fixDryRun) && (quiet ? quietFixPredicate : true),
    */
    fixTypes: fixType,
    ignore,
    overrideConfig,
    overrideConfigFile,
    reportUnusedDisableDirectives: reportUnusedDisableDirectives ? "error" : void 0
  };

  if (configType === "flat") {
    options.ignorePatterns = ignorePattern;
  } else {
    options.resolvePluginsRelativeTo = resolvePluginsRelativeTo;
    options.rulePaths = rulesdir;
    options.useEslintrc = eslintrc;
    options.extensions = ext;
    options.ignorePath = ignorePath;
  }

  return options;
}
