# README

## Deploy

### 1. Set Variables

```bash
RG=my-resource-group
ACR=myacr
WEB_PLAN=my-web-plan
BOT=my-bot
IMAGE=dlspeech
SPEECH=my-speech
PW=$(openssl rand -base64 16)
```

Check your active subscription

```bash
az account show
```

If it is not correct, list all of your subscriptions and set the correct one:

```bash
az account list --query '[].[name, id]'
az account set -s YOUR_SUBSCRIPTION_ID
```

### 2. Create Resource Group

```bash
az group create -n $RG -l eastus
```

### 3. Create Container Registry

```bash
az acr create -g $RG -n $ACR --sku Standard --admin-enabled
```

### 4. Build Container Image

```bash
az acr build -g $RG -r $ACR -t $IMAGE:latest -t $IMAGE:{{.Run.ID}} .
```

### 5. Create Linux Web App

```bash
az appservice plan create -g $RG -n $WEB_PLAN --is-linux
az webapp create -g $RG -p $WEB_PLAN -n $BOT --runtime 'node|10.14'
```

### 6. Create Bot Registration

```bash
MSA=$(az ad app create --display-name $BOT --password $PW --available-to-other-tenants --query appId -o tsv)
az bot create --appid $MSA -k registration -n $BOT -p $PW -g $RG -e https://$BOT.azurewebsites.net/api/messages
```


### 7. Configure Web App

```bash
ACR_KEY=$(az acr credential show -g $RG -n $ACR --query passwords[0].value -o tsv)
DIRECT_LINE_KEY=$(az bot directline show -g $RG -n $BOT --with-secrets --query properties.properties.sites[0].key -o tsv)

az webapp config appsettings set -g $RG -n $BOT --settings \
  MSA_APP_ID=$MSA \
  MSA_PASSWORD=$PW \
  DIRECT_LINE_KEY=$DIRECT_LINE_KEY \
  DOCKER_ENABLE_CI=true

az webapp config container set -g $RG --name $BOT \
  --docker-custom-image-name $ACR.azurecr.io/$IMAGE:latest \
  --docker-registry-server-password $ACR_KEY \
  --docker-registry-server-url https://$ACR.azurecr.io \
  --docker-registry-server-user $ACR
```

### 8. Configure Bot (manual)

1.  Navigate to bot resource page in [Azure Portal](https://portal.azure.com/)
2.  Open the `Settings` tab
3.  Check `Enable Streaming Endpoint`
4.  Click `Save`
5.  Open the `Channels` tab
6.  Click the `Direct Line Speech` icon
7.  _Copy one of the __Secret Keys__ for later use_ (`DIRECT_LINE_SPEECH_KEY`)
8.  Click `Save` 
9.  Go back to the main `Channels` page
10. Click `Edit` next to `Direct Line`
11. _Copy one of the __App Service Extensions Keys__ for later use_ (`DIRECT_LINE_EXTENSION_KEY`)

### 9. Configure Web App for App Service Extension

> This only applies to bots deployed to __Windows__ hosts.

Set variable from the previous step:

```bash
DIRECT_LINE_EXTENSION_KEY=xyz
```

Apply configuration to the web site:

```bash
az webapp config appsettings set -g $RG -n $BOT --settings \
  DirectLineExtensionKey=$DIRECT_LINE_EXTENSION_KEY \
  DIRECTLINE_EXTENSION_VERSION=latest
```

Enable WebSockets (Windows/.NET only?)

```bash
az webapp config set -g $RG -n $BOT --web-sockets-enabled true
```

### 10. Create Speech Service

> Currently `westus2` is the only supported region for __Direct Line Speech__

```bash
az cognitiveservices account create --kind SpeechServices --sku S0 -g $RG -n $SPEECH -l westus2
```

Now list your keys:

```bash
az cognitiveservices account keys list -g $RG -n $SPEECH
```
