# Backend API — Docker, Kubernetes & Railway

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-containerised-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-manifests-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-deployed-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**REST API built with Node.js + PostgreSQL, containerised with Docker, deployable on Kubernetes and Railway.**

</div>

## Overview

Simple CRUD API for an `items` resource, demonstrating a full backend engineering workflow:

- **Node.js + Express** REST API
- **PostgreSQL** database with SQL migration
- **Docker + Docker Compose** for local development
- **Kubernetes manifests** for production orchestration
- **GitHub Actions** CI/CD — auto-deploy to Railway on push to `main`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API status |
| `GET` | `/health` | Health check |
| `GET` | `/items` | List all items |
| `GET` | `/items/:id` | Get one item |
| `POST` | `/items` | Create an item — body: `{ "name": "...", "description": "..." }` |

## Running Locally

### With Docker (recommended)

```bash
docker compose up -d
# API → http://localhost:3000
```

### Without Docker

```bash
npm install
cp .env.example .env   # fill in your Postgres credentials
npm start
```

## Deploying on Kubernetes

```bash
minikube start
kubectl apply -f kubernetes/
kubectl port-forward svc/backend-service 8080:80
# API → http://localhost:8080
```

## Deploying on Railway

1. Create a project on [Railway](https://railway.app) and connect this repo
2. Add a **Postgres** plugin — `DATABASE_URL` is injected automatically
3. Add `RAILWAY_TOKEN` and `RAILWAY_SERVICE` in GitHub Actions secrets/variables
4. Push to `main` — the pipeline deploys automatically

## Environment Variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Railway / production (full connection string) |
| `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME` | Local development |
| `PORT` | Server port (default: `3000`) |

