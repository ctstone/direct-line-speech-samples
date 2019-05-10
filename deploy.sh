#! /usr/bin/env bash

MSA_APP_ID=$1
MSA_APP_PW=$2
RG=$3
ACR=$4
WEB=$5
PLAN=$6

IMAGE=direct-line-speech-demo-server

# BUILD CONTAINER IMAGE
az acr build \
  --resource-group $RG \
  --registry $ACR \
  --image $IMAGE:{{.Run.ID}} \
  --image $IMAGE:latest \
  Server
  
# CREATE WEB APP
az webapp create \
  --resource-group $RG \
  --name $WEB \
  --plan $PLAN \
  --runtime 'aspnet|v4.7'
  
# CONFIGURE WEB APP SETTINGS
az webapp config appsettings set \
  --resource-group $RG \
  --name $WEB \
  --settings \
    MSA_APP_ID=$MSA_APP_ID \
    MSA_PASSWORD=$MSA_PASSWORD

# CONFIGURE WEB APP CONTAINER IMAGE
ACR_KEY=$(az acr credential show \
  --resource-group $RG \
  --name $ACR \
  --query passwords[0].value \
  --output tsv)
az webapp config container set \
  --resource-group $RG \
  --name $WEB \
  --docker-custom-image-name $ACR.azurecr.io/$IMAGE:latest \
  --docker-registry-server-password $ACR_KEY \
  --docker-registry-server-url https://$ACR.azurecr.io \
  --docker-registry-server-user $ACR