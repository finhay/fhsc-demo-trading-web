#!/bin/bash

WORKSPACE=$1
DEPLOYMENT=$2
IMAGE_NAME=$3
IMAGE_VERSION=$4
REPO_URL=$5
K8SCLS=$6
export KUBECONFIG=/var/lib/jenkins/.kube/$K8SCLS
kubectl cluster-info

echo "START UPDATE IMAGES $IMAGE_VERSION ON $WORKSPAICE - $DEPLOYMENT"
kubectl set image deployment/${DEPLOYMENT} ${DEPLOYMENT}=${REPO_URL}/${IMAGE_NAME}:${IMAGE_VERSION} --record -n $WORKSPACE
# STRCOMAND=""
echo "STRCOMAND: " $STRCOMAND
# ansible masters -a "$STRCOMAND" -i /var/lib/jenkins/hostsk8scluster
