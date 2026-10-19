# Task Management Full-Stack Application

[![CI Pipeline](https://github.com/USERNAME/REPOSITORY/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPOSITORY/actions/workflows/ci.yml)

> Full-stack containerized Task Management application built with React (Vite), Node.js (Express), MongoDB, Docker Compose, and automated CI/CD with GitHub Actions.

---

## Practical 12: CI/CD Pipeline with GitHub Actions

### Workflow Architecture
```
git push origin main
       │
       ▼
GitHub Actions Trigger (on: push / pull_request)
       │
       ▼
Job 1: lint (ESLint) ──► Checks code quality
       │ (needs: lint)
       ▼
Job 2: build-and-test
       ├── Checkout code
       ├── Setup Node.js v20
       ├── Install dependencies (Root + Backend)
       ├── Run automated tests (`npm test` via Jest/Supertest)
       └── Build frontend production bundle (`npm run build`)
       │
       ▼
GitHub Status: Green Checkmark (Passed) or Red X (Failed)
```

---

## Scripts & Local Commands

```bash
# Run linting check
npm run lint

# Run automated tests
npm test

# Build production bundle
npm run build

# Start containerized stack via Docker Compose
docker compose up -d
```
