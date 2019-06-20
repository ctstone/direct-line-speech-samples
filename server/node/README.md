# README

## Deploy

### 1. Set Variables

```bash
RG=my-resource-group
ACR=myacr
WEB_PLAN=my-web-plan
BOT=my-bot
IMAGE=dlspeech
PW=$(openssl rand -base64 16)
```

### 2. Create Resource Group

Check your active subscription

```bash
az account show
```

If it is not correct, list all of your subscriptions and set the correct one:

```bash
az account list --query '[].[name, id]'
az account set -s YOUR_SUBSCRIPTION_ID
```

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
  LUIS_SUBSCRIPTION_REGION=$LUIS_LOCATION \
  LUIS_APP_ID_WEATHER=$LUIS_APP_ID_WEATHER \
  MSA_APP_ID=$MSA \
  MSA_PASSWORD=$PW \
  DIRECT_LINE_KEY=$DIRECT_LINE_KEY

az webapp config container set -g $RG --name $BOT \
  --docker-custom-image-name $ACR.azurecr.io/my-weather-bot:latest \
  --docker-registry-server-password $ACR_KEY \
  --docker-registry-server-url https://$ACR.azurecr.io \
  --docker-registry-server-user $ACR
```