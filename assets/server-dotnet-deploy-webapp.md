# Deploy .NET Server to Azure Web App

> This guide will help you deploy a Windows Web App to your subscription. For a containerized deployment, see [Deploy .NET Server to Azure Web App Container](./server-dotnet-deploy-webapp-container.md)

## 1. Create Resource Group

> Make sure you have completed the [Build](../server/net-core/README.md#build) steps before continuing

```bash
RESOURCE_GROUP=MyResourceGroup
az group create -n $RESOURCE_GROUP -l eastus
```

## 2. Create App Service Plan

```bash
PLAN=MyPlan
az appservice plan create -g $RESOURCE_GROUP -n $PLAN
```

## 3. Create Web App

```bash
WEB=MyWebApp
az webapp create -g $RESOURCE_GROUP -n $WEB -p $PLAN
```

## 4. Configure Web App
```bash
MSA_APP_ID=MyAppId
MSA_APP_PASSWORD=MySecretPassword

az webapp config appsettings set -g $RESOURCE_GROUP -n $WEB --settings MicrosoftAppId=$MSA_APP_ID MicrosoftAppPassword="$MSA_APP_PASSWORD"

az webapp config set -g $RESOURCE_GROUP -n $WEB --web-sockets-enabled true --use-32bit-worker-process false
```

## 5. Deploy Application Build

```bash
az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEB --src out.zip
```

Using the Azure Portal, you should now point your Bot Registration endpoint to `https://$WEB.azurewebsites.net/api/messages`
