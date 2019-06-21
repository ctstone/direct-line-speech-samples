#! /usr/bin/env bash

VERSION=0.0.1
PACKAGES="microsoft-bot-protocol microsoft-bot-protocol-namedpipe microsoft-bot-protocol-streamingextensions microsoft-bot-protocol-websocket"

for PACKAGE in $PACKAGES
do
  NAME="$PACKAGE-$VERSION.tgz"
  URL="https://botbuilder.myget.org/F/experimental/npm/$PACKAGE/-/$NAME"
  echo $NAME
  curl -sL $URL > $NAME
  tar xzf $NAME
  mv package $PACKAGE
  rm $NAME
  pushd $PACKAGE
  cp package.json package.bak.json
  for DEP in $PACKAGES
  do
    DEP_PATH="file:..\/$DEP"
    echo $DEP
    sed -i "" -e "s/\"$DEP\": \"\^$VERSION\"/\"$DEP\": \"$DEP_PATH\"/" package.json
  done
  popd
done

