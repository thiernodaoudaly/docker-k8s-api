# Backend API avec Docker et Kubernetes

Ce projet implémente une API backend simple avec Node.js et PostgreSQL, conteneurisée avec Docker et déployée avec Kubernetes.
L'API proposée est une application simple de gestion d'items, qui permet de stocker et récupérer des éléments avec un nom et une description dans une base de données.

## Prérequis

- Docker et Docker Compose
- Node.js (pour le développement local)

## Exécution locale avec Docker Compose

1. Clonez ce dépôt:
   ```bash
   git clone https://github.com/tchernodawda/docker-k8s-api.git
   cd docker-k8s-api
   ```

2. Exécutez l'application avec Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Vérifiez que l'application fonctionne:
   ```bash
   curl http://localhost:3000
   ```

4. Pour créer un nouvel item:
   ```bash
   curl -X POST http://localhost:3000/items \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Item", "description":"Description de test"}'
   ```

5. Pour récupérer tous les items:
   ```bash
   curl http://localhost:3000/items
   ```

6. Pour arrêter l'application:
   ```bash
   docker-compose down
   ```

## Exécution locale sans Docker

1. Installez les dépendances:
   ```bash
   npm install
   ```

2. Configurez une base de données PostgreSQL locale et mettez à jour le fichier `.env`

3. Initialisez la base de données avec le script `init.sql`

4. Démarrez l'application:
   ```bash
   node server.js
   ```

## Image Docker

L'image Docker du backend est disponible sur Docker Hub:
```
tchernodawda/backend:v1.0.0
```