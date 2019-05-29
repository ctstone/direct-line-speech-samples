# Direct Line Speech - .NET Core Server

This folder contains source code to run a .NET Core web server as a Direct-Line-Speech-enabled bot.

## Prerequisites

- .NET Core
- Bot Registration (MSA AppId + Password)
- Optional: Azure CLI (for Azure deployment only)

## Configure

Create `appsettings.development.json` and add the following values:

```json
{
  "MicrosoftAppId": "YOUR_MSA_APP_ID",
  "MicrosoftAppPassword": "YOUR_MSA_APP_PASSWORD"
}
```

## Run

```bash
dotnet run
```

> At this point your bot is listening at http://localhost:3979/api/messages. You should be able to connect to it using the Bot Framework Emulator, but you will not be able to connect a speech client without using a proxy tool like Ngrok, or deploying the server to an Internet-addressable host.

## Build

```bash
pushd Server
dotnet publish -c Release -o out
powershell
rm out/appsettings.Development.json
Compress-Archive -path out/* -DestinationPath out.zip -Force
exit
```

> You can also open `Server.csproj` in Visual Studio and press `F5` to begin debugging, but Visual Studio is not required.

## Deploy to Azure

- Option 1: [Deploy to Web App](../../assets/server-dotnet-deploy-webapp.md)
- Option 2: [Deploy to Web App with Container](../../assets/server-dotnet-deploy-webapp-container.md)
