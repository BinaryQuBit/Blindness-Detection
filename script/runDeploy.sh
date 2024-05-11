#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../code/frontend"
BACKEND_DIR="$SCRIPT_DIR/../code/backend"
ROOT_DIR="$SCRIPT_DIR/../" 

echo "Going into Front End..."
cd "$FRONTEND_DIR"

echo "Installing Front End Dependencies..."
npm i

echo "Building the Front End..."
npm run build

echo "Going into Back End..."
cd "$BACKEND_DIR"

if [ -d "dist" ]; then
  echo "Removing existing dist directory in backend..."
  rm -rf dist
fi

echo "Copying Out to Backend..."
cp -R "$FRONTEND_DIR/out" .

echo "Deleting Out from Front End..."
rm -rf "$FRONTEND_DIR/out"

echo "Changing to Root/code"
cd "$ROOT_DIR/code"

echo "Building Docker Compose File..."
docker-compose build

echo "Loging in to Docker"
docker login

echo "Tagging Image"
docker tag code-blindnessdetection binaryqubit/blindness-detection:latest

echo "Pushing Image"
docker push binaryqubit/blindness-detection:latest

echo "Deleting Images"
docker rmi -f $(docker images -q)