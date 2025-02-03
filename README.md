# VGR

Video Game Repo, manage your game collection.

## Dockerfiles

### API

```bash
docker build -f docker/api.Dockerfile -t vgr-api ./api

docker run -p 8000:8000 -d --name vgr-api vgr-api
```