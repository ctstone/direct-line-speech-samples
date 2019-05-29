# Direct Line Speech - Java Client

This folder contains source code to run a Java application from the command line that connects to a Direct-Line-Speech-enabled bot.

## Prerequisites

- Java 8
- Maven
- Speech Service key
- Direct Line Speech channel secret

## Configure

1. Edit [./src/main/java/speechsdk/quickstart/App.java](App.java)
1. Set `channelSecret` to your Direct Line Speech channel secret
1. Set `subscriptionKey` to your Speech Service subscription key
1. As of this writing the only supported region is `westus2`. Change the `region` value if needed.

## Build

1. `mvn package`

## Run

1. `java -cp ./target/quickstart-1.0-SNAPSHOT.jar speechsdk.quickstart.App`
