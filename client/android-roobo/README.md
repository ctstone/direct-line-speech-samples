# Speech Client - Android

> Derived from https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-devices-sdk-android-quickstart

1. Download "command line tools only" -> https://developer.android.com/studio/#downloads
1. Unzip the tools
1. `export ANDROID_SDK_ROOT=/path/to/tools`
    This directory should contain the `tools` folder
1. `$ANDROID_SDK_ROOT/tools/bin/sdkmanager --licenses`
1. `touch ~/.android/repositories.cfg`
1. `./gradlew installDebug`
1. Connect to device with Vysor
1. Open the `Speech Recognition App` on your device