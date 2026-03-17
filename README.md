# Backend API — Docker, Kubernetes & Railway

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-containerised-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-manifests-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-deployed-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/thierno/docker-k8s-api/deploy.yml?style=flat-square&label=Deploy)

**A production-ready REST API built with Node.js + PostgreSQL, containerised with Docker, and deployable on both Kubernetes and Railway.**

**Live demo:** https://docker-k8s-api-production.up.railway.app

</div>

## Overview

This project demonstrates a complete backend engineering workflow:

- A **REST API** (Node.js + Express) exposing CRUD operations on an `items` resource
- A **PostgreSQL** database, initialised with a SQL migration script
- **Dockerisation** via a multi-stage-friendly `Dockerfile` and `docker-compose.yaml` for local development
- **Kubernetes manifests** for production-grade orchestration (Deployments, Services, PVC, Secrets, ConfigMaps)
- **CI/CD pipelines** via GitHub Actions — automatic deployment to Railway on every push to `main`, and Docker image build & push to Docker Hub on every release tag

## Project Structure

```
docker-k8s-api/
├── server.js                         # Express app — routes and startup logic
├── db.js                             # PostgreSQL connection pool + retry logic
├── init.sql                          # DB initialisation — creates the items table
├── package.json
├── Dockerfile                        # Production image (node:20-alpine)
├── docker-compose.yaml               # Local dev stack (API + Postgres)
├── .env.example                      # Environment variable template
├── kubernetes/
│   ├── backend-deployment.yaml       # API Deployment (1 replica)
│   ├── backend-service.yaml          # NodePort Service for the API
│   ├── postgres-deployment.yaml      # Postgres Deployment
│   ├── postgres-service.yaml         # ClusterIP Service for Postgres
│   ├── postgres-pvc.yaml             # PersistentVolumeClaim (1Gi)
│   ├── postgres-config.yaml          # ConfigMap — DB name & user
│   ├── postgres-secret.yaml          # Secret — DB password (base64)
│   └── postgres-init-script.yaml     # ConfigMap — init.sql for K8s
└── .github/
    └── workflows/
        ├── deploy.yml                # Auto-deploy to Railway on push to main
        └── docker-image.yml          # Build & push Docker image on release tags
```

## API Reference

Base URL (local): `http://localhost:3000`  
Base URL (Railway): `https://docker-k8s-api-production.up.railway.app`

### Endpoints

| Method | Path | Description | Request body | Success response |
|--------|------|-------------|--------------|-----------------|
| `GET` | `/` | API status check | — | `{ "message": "API is running" }` |
| `GET` | `/health` | Health check (used by Railway) | — | `{ "status": "ok" }` |
| `GET` | `/items` | Retrieve all items | — | `200` — array of items |
| `GET` | `/items/:id` | Retrieve one item by ID | — | `200` — item object · `404` if not found |
| `POST` | `/items` | Create a new item | `{ "name": "...", "description": "..." }` | `201` — created item |

### Item schema

```json
{
  "id": 1,
  "name": "My item",
  "description": "A short description",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Example requests

```bash
# Check the API is up
curl https://docker-k8s-api-production.up.railway.app/

# Create an item
curl -X POST https://docker-k8s-api-production.up.railway.app/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "My first item"}'

# Retrieve all items
curl https://docker-k8s-api-production.up.railway.app/items

# Retrieve item with ID 1
curl https://docker-k8s-api-production.up.railway.app/items/1
```

## Environment Variables

Copy `.env.example` to `.env` before running locally. Never commit `.env` to version control.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes (Railway/prod) | Full Postgres connection string — takes priority over individual fields | `postgresql://user:pass@host:5432/db` |
| `POSTGRESQL_URL` | Yes (Railway/prod) | Alias for `DATABASE_URL` — Railway may inject either one | same format |
| `DB_USER` | Yes (local) | Postgres username | `postgres` |
| `DB_PASSWORD` | Yes (local) | Postgres password | `password` |
| `DB_HOST` | Yes (local) | Postgres host | `localhost` |
| `DB_PORT` | No | Postgres port (default: `5432`) | `5432` |
| `DB_NAME` | Yes (local) | Database name | `apidb` |
| `NODE_ENV` | No | Runtime environment (`development` / `production`) | `production` |
| `PORT` | No | HTTP port the server listens on (default: `3000`) | `3000` |

> **On Railway**, `DATABASE_URL` is automatically injected when you link a Postgres plugin to your service — you don't need to set it manually.

## Running Locally

### Option A — Docker Compose (recommended)

Starts both the API and a Postgres container in one command. No local Node.js or Postgres installation needed.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/thiernodaoudaly/docker-k8s-api.git
cd docker-k8s-api

# 2. Start the full stack (API on :3000, Postgres on :5432)
docker compose up -d

# 3. Confirm both containers are running
docker compose ps

# 4. Test the API
curl http://localhost:3000/
curl http://localhost:3000/items

# 5. Tail the API logs
docker compose logs -f backend

# 6. Stop and remove containers
docker compose down

# (optional) Remove the Postgres volume as well
docker compose down -v
```

The `docker-compose.yaml` mounts `init.sql` into Postgres at startup, so the `items` table is created automatically on first run.

### Option B — Node.js directly (no Docker)

**Prerequisites:** Node.js ≥ 20, a running PostgreSQL instance.

```bash
# 1. Clone the repo
git clone https://github.com/thierno/docker-k8s-api.git
cd docker-k8s-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your local Postgres credentials

# 4. Initialise the database (run once)
psql -U postgres -d apidb -f init.sql

# 5. Start the server
npm start
# or, for auto-reload during development:
npm run dev
```

## Deploying on Kubernetes

These instructions use [Minikube](https://minikube.sigs.k8s.io/) for local Kubernetes. The same manifests work on any cluster (GKE, EKS, AKS, etc.) with minor adjustments to the Service type.

**Prerequisites:** `kubectl` and `minikube` installed.

```bash
# 1. Start a local cluster
minikube start

# 2. Apply all manifests at once (order is handled automatically)
kubectl apply -f kubernetes/

# 3. Check that all pods reach the Running state (may take ~30s)
kubectl get pods --watch

# 4. List Services and their exposed ports
kubectl get services
```

Expected output:
```
NAME               TYPE        CLUSTER-IP      PORT(S)
backend-service    NodePort    10.96.x.x       80:3xxxx/TCP
postgres           ClusterIP   10.96.x.x       5432/TCP
```

```bash
# 5. Forward the backend port to your local machine
kubectl port-forward svc/backend-service 8080:80

# 6. Test the API through the forwarded port
curl http://localhost:8080/
curl http://localhost:8080/items
curl -X POST http://localhost:8080/items \
  -H "Content-Type: application/json" \
  -d '{"name": "K8s item", "description": "Created via Kubernetes"}'
```

### Kubernetes architecture

```
┌─────────────────────────── Cluster ─────────────────────────────┐
│                                                                  │
│   ┌──────────────┐   ClusterIP    ┌──────────────────────────┐  │
│   │   backend    │ ─────────────► │        postgres          │  │
│   │  Deployment  │  :5432         │       Deployment         │  │
│   │  (Node.js)   │                │  (postgres:14-alpine)    │  │
│   └──────┬───────┘                └─────────────┬────────────┘  │
│          │                                      │               │
│   NodePort Service                    PersistentVolumeClaim      │
│   (port 80 → 3000)                         (1Gi)                │
│          │                                                       │
└──────────┼───────────────────────────────────────────────────────┘
           │
    kubectl port-forward
           │
     localhost:8080
```

### Updating the Docker image in the cluster

```bash
# After building and pushing a new image (e.g. thierno/backend:v1.1.0):
kubectl set image deployment/backend backend=thierno/backend:v1.1.0

# Watch the rolling update
kubectl rollout status deployment/backend

# Roll back if something goes wrong
kubectl rollout undo deployment/backend
```

---

## Deploying on Railway

Railway is the primary cloud target for this project. It builds the Docker image directly from the repo and injects environment variables automatically.

### First-time setup

1. Create a new project on [Railway](https://railway.app)
2. Add a **GitHub** service pointing to this repository
3. Add a **Postgres** plugin — Railway will automatically inject `DATABASE_URL` into your service
4. In **Settings → Service**, set the **Health Check Path** to `/health`
5. Copy your **Railway token** from Account Settings → Tokens
6. In your GitHub repository go to **Settings → Secrets and variables → Actions** and add:
   - `RAILWAY_TOKEN` → your Railway token (secret)
7. Go to **Settings → Variables → Actions** and add:
   - `RAILWAY_SERVICE` → the name of your Railway service (e.g. `docker-k8s-api`)

### How the CI/CD pipeline works

```
Push to main
     │
     ▼
GitHub Actions: deploy.yml
     │
     ├── npm ci (install & validate dependencies)
     │
     └── railway deploy --service <RAILWAY_SERVICE> --detach
              │
              ▼
         Railway builds the Docker image from the Dockerfile
              │
              ▼
         New container starts → waitForDatabase() retries until Postgres is ready
              │
              ▼
         Health check on /health passes → traffic switches to new deployment
```

> The `waitForDatabase()` function in `db.js` retries the Postgres connection up to 10 times with exponential backoff. This prevents the app from crashing during Railway cold starts when the database takes a few seconds to become available.

## Docker Image

The production image is published to Docker Hub on every release tag (`v*.*.*`):

```
tchernodawda/backend:latest
tchernodawda/backend:1.0.0
```

Pull and run manually:

```bash
docker pull tchernodawda/backend:latest

docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  thierno/backend:latest
```

## CI/CD Workflows

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| Deploy to Railway | `deploy.yml` | Push to `main` | Installs deps, runs `railway deploy` |
| Docker Image CI | `docker-image.yml` | Push tag `v*.*.*` or PR to `main` | Builds image, pushes to Docker Hub with semver + sha tags |

## License

This project is licensed under the MIT License.

<!-- <div align="center">
  Made by <a href="https://github.com/thiernodaoudaly">Thierno Daouda LY</a> · Computer Science & AI Engineering
</div> -->