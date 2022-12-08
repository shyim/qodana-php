import {EslintPluginState, ESLintRequest, ESLintResponse, FileKind, RequestArguments} from "./eslint-api"
import {containsString, normalizePath, requireInContext, requireResolveInContext} from "./eslint-common"

export class ESLint8Plugin implements LanguagePlugin {
  private static readonly GetErrors: string = "GetErrors";
  private static readonly FixErrors: string = "FixErrors";
  private readonly includeSourceText: boolean | null;
  private readonly additionalRulesDirectory?: string;
  private readonly ESLint: any;
  private readonly libOptions: any;

  constructor(state: EslintPluginState) {
    this.includeSourceText = state.includeSourceText;
    this.additionalRulesDirectory = state.additionalRootDirectory;

    let eslintPackagePath = normalizePath(state.eslintPackagePath);
    this.ESLint = requireInContext(eslintPackagePath, state.packageJsonPath).ESLint;

    try {
      const apiJsPath = requireResolveInContext(eslintPackagePath, state.packageJsonPath);
      this.libOptions = requireInContext("../lib/options" /* path relative to eslint/lib/api.js */, apiJsPath);
    }
    catch (e) {
      this.libOptions = null;
    }
  }

  async onMessage(p: string, writer: MessageWriter) {
    const request: ESLintRequest = JSON.parse(p);
    let response: ESLintResponse = new ESLintResponse(request.seq, request.command);
    try {
      if (request.command === ESLint8Plugin.GetErrors) {
        let lintResults: ESLint.LintResult[] = await this.getErrors(request.arguments);
        response.body = {results: this.filterSourceIfNeeded(lintResults)};
      }
      else if (request.command === ESLint8Plugin.FixErrors) {
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
    const CLIOptions =
      this.libOptions instanceof Function
        ? this.libOptions(false) // eslint 8.23+
        : this.libOptions;

    const parsedCommandLineOptions =
      CLIOptions != null && CLIOptions.parse instanceof Function
        ? translateOptions(CLIOptions.parse(requestArguments.extraOptions || ""))
        : {}

    const options: ESLint.Options = {...parsedCommandLineOptions, ...additionalOptions};

    options.ignorePath = requestArguments.ignoreFilePath;

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

    const eslint = new this.ESLint(options);

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


// See https://github.com/eslint/eslint/blob/f1b7499a5162d3be918328ce496eb80692353a5a/lib/cli.js#L62
/**
 * Translates the CLI options into the options expected by the CLIEngine.
 * @param {ParsedCLIOptions} cliOptions The CLI options to translate.
 * @returns {ESLintOptions} The options object for the CLIEngine.
 * @private
 */
function translateOptions({
                            cache,
                            cacheFile,
                            cacheLocation,
                            cacheStrategy,
                            config,
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
                          }) {
  return {
    allowInlineConfig: inlineConfig,
    cache,
    cacheLocation: cacheLocation || cacheFile,
    cacheStrategy,
    errorOnUnmatchedPattern,
    extensions: ext,
    // fix: (fix || fixDryRun) && (quiet ? quietFixPredicate : true),
    fixTypes: fixType,
    ignore,
    ignorePath,
    overrideConfig: {
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
    },
    overrideConfigFile: config,
    reportUnusedDisableDirectives: reportUnusedDisableDirectives ? "error" : void 0,
    resolvePluginsRelativeTo,
    rulePaths: rulesdir,
    useEslintrc: eslintrc
  };
}
