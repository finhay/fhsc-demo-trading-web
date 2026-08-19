#!/bin/bash
WORKSPACE=$1
DEPLOYMENT=$2
IMAGE_NAME=$3
IMAGE_VERSION=$4
REPO_URL=$5

sudo docker build -t ${IMAGE_NAME}:${IMAGE_VERSION} --build-arg WORKSPACE=${WORKSPACE} .
sudo docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${REPO_URL}/${IMAGE_NAME}:${IMAGE_VERSION}
sudo docker push ${REPO_URL}/${IMAGE_NAME}:${IMAGE_VERSION}
# sudo docker push registry.fke.fptcloud.com/fcd517fc-8bf2-48de-9b42-e8b5ffa1a535/${IMAGE_NAME}:${IMAGE_VERSION}
