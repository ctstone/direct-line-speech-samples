#! /usr/bin/env bash

MSA_APP_ID=$1
MSA_APP_PW=$2
RG=$3
WEB=$4
PLAN=$5

# CREATE APP SERVICE PLAN
az appservice plan create \
  --resource-group $RG \
  --name $PLAN

# CREATE WEB APP
az webapp create \
  --resource-group $RG \
  --name $WEB \
  --plan $PLAN
  
# CONFIGURE WEB APP
az webapp config appsettings set \
  --resource-group $RG \
  --name $WEB \
  --settings \
    MicrosoftAppId=$MSA_APP_ID \
    MicrosoftAppPassword="$MSA_PASSWORD"
az webapp config set \
  --resource-group $RG \
  --name $WEB \
  --web-sockets-enabled true \
  --use-32bit-worker-process false
    
# Build
pushd Server
dotnet publish -c Release -o out
powershell
rm out/appsettings.Development.json
Compress-Archive -path out/* -DestinationPath out.zip -Force
exit

# Deploy
az webapp deployment source config-zip \
  --resource-group $RG \
  --name $WEB \
  --src out.zip