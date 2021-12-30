FROM jetbrains/qodana-php:latest

COPY rootfs/ /

ENTRYPOINT ["/entrypoint.sh"]