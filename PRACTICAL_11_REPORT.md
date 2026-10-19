# Practical 11: Containerization with Docker and Docker Compose

**Course Outcomes / Program Outcomes:** CO5 / PO3, PO5  
**Objective:** To containerize the full-stack Task Management application using Docker and orchestrate services using Docker Compose.

---

## 1. Architecture & Service Orchestration

```text
docker-compose.yml
├── frontend (React, built + served, port 5173)
├── backend (Node/Express, port 5000)
└── mongodb (official mongo image, port 27017)
Network: app-network (bridge)
frontend ──► backend ──► mongodb
All 3 services start together via: docker compose up
```

---

## 2. Implemented Files Summary

| File | Location | Purpose |
| :--- | :--- | :--- |
| `Dockerfile` | Project Root | Builds and serves the React Vite frontend using Vite preview on port `5173`. |
| `backend/Dockerfile` | `backend/` | Builds and runs the Node.js/Express server on port `5000`. |
| `.dockerignore` | Project Root | Excludes `node_modules`, `backend/`, `dist`, `.env*`, and git files from frontend context. |
| `backend/.dockerignore` | `backend/` | Excludes `node_modules`, `.env*`, and git files from backend context. |
| `docker-compose.yml` | Project Root | Orchestrates `frontend`, `backend`, and `mongodb` on `app-network` with `mongo-data` volume. |
| `Dockerfile.multistage` | Project Root | **Supplementary**: Multi-stage build with Nginx reducing image size from ~1.1GB to ~25MB. |
| `nginx.conf` | Project Root | **Supplementary**: Nginx reverse proxy configuration for React SPA routing. |
| `backend/server.js` | `backend/` | Updated fallback to `mongodb://mongodb:27017/taskdb` for container DNS resolution. |
| `vite.config.js` | Project Root | Configured `preview.proxy` and `host: true` to route `/api` to `backend:5000`. |

---

## 3. Configuration & Dockerfiles

### 3.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Backend Dockerfile for Node.js / Express
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code into container
COPY . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
```

### 3.2 Frontend Dockerfile (`Dockerfile`)
```dockerfile
# Frontend Dockerfile for React (Vite)
# Using Node 22 for Vite 8+ compatibility
FROM node:22 AS build

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy application source code into container
COPY . .

# Build production bundle
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve production build accessible to Docker network
CMD ["npm", "run", "preview", "--", "--host"]
```

### 3.3 Docker Compose File (`docker-compose.yml`)
```yaml
services:
  # ==========================================
  # Service 1: MongoDB Database
  # ==========================================
  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=taskdb
    volumes:
      # Named volume for persistent database storage across restarts
      - mongo-data:/data/db
    networks:
      - app-network

  # ==========================================
  # Service 2: Node.js / Express Backend
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/taskdb
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - app-network

  # ==========================================
  # Service 3: React Frontend (Vite)
  # ==========================================
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend
    restart: always
    ports:
      - "5173:5173"
    environment:
      - VITE_BACKEND_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - app-network

# ==========================================
# Network: Custom bridge network
# ==========================================
networks:
  app-network:
    driver: bridge

# ==========================================
# Volumes: Named volume for MongoDB persistence
# ==========================================
volumes:
  mongo-data:
    driver: local
```

---

## 4. Key Questions & Analysis

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
> **Answer:**  
> In Docker, each container operates in its own isolated network namespace with its own `localhost` (127.0.0.1) loopback adapter.
> - If the backend container attempts to connect to `localhost:27017`, it looks for a MongoDB process running *inside its own container*, which results in a `Connection Refused` error.
> - When containers share a user-defined bridge network (e.g., `app-network`), Docker provides an automatic embedded DNS server (`127.0.0.11`).
> - Docker Compose automatically maps the service name `mongodb` to the internal IP address assigned to that container. Thus, `mongodb://mongodb:27017/taskdb` resolves dynamically across the internal bridge network.

---

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
> **Answer:**  
> - **`EXPOSE` (Dockerfile):** Acts as documentation and metadata. It declares that the containerized process listens on the specified port, but does **not** map or publish that port to the host machine.
> - **`ports` (docker-compose.yml):** Binds a host port to a container port (`<host_port>:<container_port>`). It configures host networking and firewall/iptables rules so external clients (e.g., a host web browser at `http://localhost:5173`) can route traffic directly into the container.

---

### Q3: Why is it bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
> **Answer:**  
> 1. **OS & Architecture Incompatibility:** Host machines (such as Windows with NTFS) compile native C/C++ bindings (e.g., with node-gyp) specifically for the host OS. Copying host `node_modules` into a Linux container causes runtime crashes (e.g., `invalid ELF header`).
> 2. **Bloated Build Context:** `node_modules` contains tens of thousands of files. Transferring them to the Docker daemon severely degrades build performance and increases image size.
> 3. **Breaks Layer Caching:** By copying only `package*.json` first and running `RUN npm install`, Docker caches the installed modules layer. Future source code edits will skip `npm install` and build in seconds.

---

## 5. Supplementary Solutions

1. **`.dockerignore` Optimization:**
   - Both root and backend `.dockerignore` files exclude `node_modules`, `.env*`, `.git`, and build outputs.
   - The root `.dockerignore` explicitly excludes `backend/` to prevent unnecessary backend code from bloating the frontend image.

2. **Multi-Stage Build (`Dockerfile.multistage`):**
   - Stage 1 compiles the Vite bundle using Node 18.
   - Stage 2 copies solely the `/app/dist` folder into `nginx:alpine`.
   - Result: Final image footprint drops from **~1.1 GB to ~25 MB**.

3. **MongoDB Data Persistence:**
   - The named volume `mongo-data` is mounted to `/data/db`.
   - Data persists across `docker compose down` and container recreation.

---

## 6. How to Run and Verify

```bash
# 1. Build and start all 3 containers in detached mode
docker compose up --build -d

# 2. Check running container status
docker ps

# 3. View container logs
docker compose logs -f

# 4. Stop all containers (preserving persistent database volume)
docker compose down

# 5. Stop containers and delete volumes (complete clean reset)
docker compose down -v
```
