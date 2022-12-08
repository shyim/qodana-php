FROM jetbrains/qodana-php:2022.3-eap

COPY rootfs/ /

ENTRYPOINT ["/entrypoint.sh"]
