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
done

