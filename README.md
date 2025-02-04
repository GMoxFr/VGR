# VGR

Video Game Repo, manage your game collection.

## Dockerfiles

### API

```bash
docker build -f docker/api.Dockerfile -t vgr-api ./api

docker run -p 8000:8000 -d --name vgr-api vgr-api
```

## Kubernetes

### API

```bash
kubectl apply -f kubernetes/deployment-api.yml

kubectl create secret docker-registry regcred \
    --docker-server=https://index.docker.io/v1/ \
    --docker-username=$DOCKER_USERNAME \
    --docker-password=$DOCKER_TOKEN \
    --docker-email=$DOCKER_EMAIL

kubectl apply -f kubernetes/service-api.yml
```