#!/usr/bin/env bash

ideaDir="/data/project/.idea"

if [[ ! -d "$ideaDir" ]]; then
  mkdir -p "$ideaDir"
fi

if [[ ! -f "$ideaDir/symfony2.xml" ]]; then
  cp /opt/php-cfg/.idea/symfony2.xml "$ideaDir/symfony2.xml"
fi

if [[ ! -f "$ideaDir/workspace.xml" ]]; then
  cp /opt/php-cfg/.idea/workspace.xml "$ideaDir/workspace.xml"
fi

exec /opt/idea/bin/entrypoint "$@"