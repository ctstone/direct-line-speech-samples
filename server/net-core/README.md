# Direct Line Speech - .NET Core Server

This folder contains source code to run a .NET Core web server as a Direct-Line-Speech-enabled bot.

## Prerequisites

- .NET Core
- Bot Registration (MSA AppId + Password)
- Optional: Azure CLI (for Azure deployment only)

## Configure

Create [appsettings.development.json] and add the following values:

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

## Deploy to Azure Web App

> Make sure you have followed the steps in `Build` before continuing

### 1. Create Resource Group

```bash
RESOURCE_GROUP=MyResourceGroup
az group create -n $RESOURCE_GROUP -l eastus
```

### 2. Create App Service Plan

```bash
PLAN=MyPlan
az appservice plan create -g $RESOURCE_GROUP -n $PLAN
```

### 3. Create Web App

```bash
WEB=MyWebApp
az webapp create -g $RESOURCE_GROUP -n $WEB -p $PLAN
```

### 4. Configure Web App
```bash
MSA_APP_ID=MyAppId
MSA_APP_PASSWORD=MySecretPassword

az webapp config appsettings set -g $RESOURCE_GROUP -n $WEB --settings MicrosoftAppId=$MSA_APP_ID MicrosoftAppPassword="$MSA_APP_PASSWORD"

az webapp config set -g $RESOURCE_GROUP -n $WEB --web-sockets-enabled true --use-32bit-worker-process false
```

### 5. Deploy Application Build

```bash
az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEB --src out.zip
```

You should now point your Bot Registration endpoint to `https://$WEB.azurewebsites.net/api/messages`

## Deploy to Azure Web App as Container

> This is an alternate deploy path for a Linux/container environment.

### 1. Create ACR

If you don't already have a private container registry, create one now:

```bash
ACR=MyContainerRegistry
az acr create -g $RESOURCE_GROUP -n $ACR --sku Standard --admin-enabled
```

### 2. Build Container Image

```bash
az acr build -g $RESOURCE_GROUP -r $ACR -t speech-server-dotnet:latest .
```

### 3. Create App Service Plan (Linux)

```bash
PLAN=MyLinuxPlan
az appservice plan create -g $RESOURCE_GROUP -n $PLAN --is-linux
```

### 4. Create Web App

```bash
WEB=MyLinuxWebApp
az webapp create -g $RESOURCE_GROUP -p $PLAN -n $WEB --runtime 'DOTNETCORE|2.2'
```

### 5. Configure Web App

See [Configure Web App](#configure-web-app) from the earlier section on this page.

### 6. Deploy Container Image

```bash
ACR_KEY=$(az acr credential show -g $RESOURCE_GROUP -n $ACR --query passwords[0].value -o tsv)

az webapp config container set -g $RESOURCE_GROUP -n $WEB \ --docker-custom-image-name $ACR.azurecr.io/speech-server-dotnet:latest \ --docker-registry-server-password $ACR_KEY \ --docker-registry-server-url https://$ACR.azurecr.io \ --docker-registry-server-user $ACR

You should now point your Bot Registration endpoint to `https://$WEB.azurewebsites.net/api/messages`
