# VGR

The Video Game Repository, manage your game collection.

## Project Overview

VGR is a microservices-based application that allows users to manage their video game collection. The application is built using various technologies. The goal of this school project was to understand the microservices architecture and how to deploy it on Kubernetes.

## Project Structure

```bash
.
├── api # API Service
├── kubernetes #  Kubernetes files (deployment, service, secret, configmap, gateway)
├── docker # Dockerfiles
├── services # Microservices
│   ├── color_palette # Palette API 
│   ├── export # Export API
│   ├── graph_stats # Graph API
│   ├── images # Image API
│   └── import # Import API
└── web # Web Service
```

## Deployment

```bash
kubectl apply -f kubernetes/*.yml # Apply all kubernetes files
```

```bash
# Create a secret for Docker registry
# This is needed to pull images from Docker Hub
kubectl create secret docker-registry regcred \
    --docker-server=https://index.docker.io/v1/ \
    --docker-username=$DOCKER_USERNAME \
    --docker-password=$DOCKER_TOKEN \
    --docker-email=$DOCKER_EMAIL
```


```bash
# Use the following command to map the gateway on port 80 on macOS
# Used during development (not needed in production environments)
sudo kubectl port-forward svc/istio-ingressgateway -n istio-system 80:80

# Minikube is recommended for local development
```