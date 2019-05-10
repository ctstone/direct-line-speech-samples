#! /usr/bin/env bash

MSA_APP_ID=$1
MSA_APP_PW=$2
RG=$3
ACR=$4
WEB=$5
PLAN=$6

# BUILD CONTAINER IMAGE
az acr build \
  --resource-group $RG \
  --registry $ACR \
  --image direct-line-speech-demo-server:{{.Run.ID}} \
  --image direct-line-speech-demo-server:latest \
  Server
  
# CREATE WEB APP
az webapp create \
  --resource-group $RG \
  --name $WEB \
  --plan $PLAN \
  --runtime 'aspnet|v4.7'