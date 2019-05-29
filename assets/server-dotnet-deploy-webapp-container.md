# Deploy .NET Server to Azure Web App Container

> This guide will help you deploy a Windows Web App Container to your subscription. For a non-containerized deployment, see [Deploy .NET Server to Azure Web App](./server-dotnet-deploy-webapp.md)

## 1. Create Resource Group

> Make sure you have completed the [Build](../server/net-core/README.md#build) steps before continuing

```bash
RESOURCE_GROUP=MyResourceGroup
az group create -n $RESOURCE_GROUP -l eastus
```

## 2. Create ACR

> Make sure you have completed the [Build](../server/net-core/README.md#build) steps before continuing

If you don't already have a private container registry, create one now:

```bash
ACR=MyContainerRegistry
az acr create -g $RESOURCE_GROUP -n $ACR --sku Standard --admin-enabled
```

## 3. Build Container Image

```bash
az acr build -g $RESOURCE_GROUP -r $ACR -t speech-server-dotnet:latest .
```

## 4. Create App Service Plan (Linux)

```bash
PLAN=MyLinuxPlan
az appservice plan create -g $RESOURCE_GROUP -n $PLAN --is-linux
```

## 5. Create Web App

```bash
WEB=MyLinuxWebApp
az webapp create -g $RESOURCE_GROUP -p $PLAN -n $WEB --runtime 'DOTNETCORE|2.2'
```

## 6. Configure Web App

See [Configure Web App](./server-dotnet-deploy-webapp.md#4-configure-web-app) from the non-containerized guide.

## 7. Deploy Container Image

```bash
ACR_KEY=$(az acr credential show -g $RESOURCE_GROUP -n $ACR --query passwords[0].value -o tsv)

az webapp config container set -g $RESOURCE_GROUP -n $WEB --docker-custom-image-name $ACR.azurecr.io/speech-server-dotnet:latest --docker-registry-server-password $ACR_KEY --docker-registry-server-url https://$ACR.azurecr.io --docker-registry-server-user $ACR

You should now point your Bot Registration endpoint to `https://$WEB.azurewebsites.net/api/messages`