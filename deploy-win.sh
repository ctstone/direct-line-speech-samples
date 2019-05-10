#! /usr/bin/env bash

MSA_APP_ID=$1
MSA_APP_PW=$2
RG=$3
ACR=$4
WEB=$5
PLAN=$6
DEPLOY_PW=$7

# CREATE APP SERVICE PLAN
az appservice plan create \
  --resource-group $RG \
  --name $PLAN

# CREATE WEB APP
az webapp create \
  --resource-group $RG \
  --name $WEB \
  --plan $PLAN
  
# CONFIGURE WEB APP SETTINGS
az webapp config appsettings set \
  --resource-group $RG \
  --name $WEB \
  --settings \
    MicrosoftAppId=$MSA_APP_ID \
    MicrosoftAppPassword="$MSA_PASSWORD"
    
# Build server
pushd Server
dotnet publish -c Release -o out
powershell
rm out/appsettings.Development.json
Compress-Archive -path out/* -DestinationPath out.zip
exit

# Deploy
az webapp deployment source config-zip \
  --resource-group $RG \
  --name $WEB \
  --src out.zip