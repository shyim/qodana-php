# Customized Qodana-PHP

This is an customized qodana-php docker image to include the Symfony Plugin and PHP Inspections EA Extended which adds a lot of inspections.

## Changes to original Image

- Added Symfony Plugin
- Added PHP Annotations Plugin
- Added PHP Inspections EA Extended
- Pre-enabled Symfony Plugin to pass container warnings and other
- Pre-enabled Composer sync to pass namespace path mapping
- Installed all PHP extensions to composer install does not fail

## Use the image

```yaml
# .qodana.yaml
version: "1.0"
# Following PHP versions are available: 8.0, 8.1 and 8.2
linter: ghcr.io/shyim/qodana-php:8.1
```

## Run it locally

```bash
docker run --rm -it -p8080:8080 -v $(pwd):/data/project ghcr.io/shyim/qodana-php:8.1 --show-report
```

## Tips

- If you use Symfony, warm up the cache before using `bin/console` so Symfony Plugin can find a container.xml
- The default configuration does not check much. It is recommanded to create a custom inspection profile to do much more as possible. See example folder for a base files
