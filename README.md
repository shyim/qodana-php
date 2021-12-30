# Customized Qodana-PHP

This is an customized qodana-php docker image to include the Symfony Plugin and PHP Inspections EA Extended which adds a lot of inspections.

## Changes to original Image

- Added Symfony Plugin
- Added PHP Annotations Plugin
- Added PHP Inspections EA Extended
- Pre-enabled Symfony Plugin to pass container warnings and other
- Pre-enabled Composer sync to pass namespace path mapping

## Run it locally

```bash
docker run --rm -it -p8080:8080 -v $(pwd):/data/project ghcr.io/shyim/qodana-php --show-report
```

## Run it in GitHub Action

**Don't forget to setup the project before with all composer dependencies and warmup the Symfony cache if its there (bin/console cache:clear)**

```yaml
- name: Run Qodana
  uses: jetbrains/qodana-action@v4.2.0
  with:
    linter: ghcr.io/shyim/qodana-php:latest
    upload-result: true
    use-annotations: true
```

## Configuration

The default configuration does not check much. It is recommanded to create a custom inspection profile to do much more as possible. See example folder for a base files
