# InvenTrack — Inventory & Order Management System

A full-stack, production-ready Inventory & Order Management System built with:

## Tech Stack

### Backend

* FastAPI
* Python
* PostgreSQL
* SQLAlchemy

### Frontend

* React
* Vite
* Tailwind CSS

### DevOps & Infrastructure

* Docker
* Docker Compose
* Render
* Vercel

---

# Live Links

### Live Frontend

https://inventory-system-ochre-six.vercel.app/dashboard

### Backend API

https://inventory-system-bvf7.onrender.com

### Swagger Documentation

https://inventory-system-bvf7.onrender.com/docs

### GitHub Repository

https://github.com/Himanshucc01/inventory-system

### Docker Backend Image

https://hub.docker.com/r/himxnshu001/inventory-backend

---

## Features

* Products CRUD management with SKU validation
* Customer management with unique email validation
* Real-time inventory stock tracking
* Order placement with automatic stock reduction
* Order cancellation with stock restoration
* Dashboard analytics and low-stock alerts
* Dockerized full-stack architecture
* Production deployment support

---

## Quick Start (Docker Compose)

### Prerequisites

* Docker ≥ 24.x
* Docker Compose ≥ 2.x

### Steps

```bash id="z9x2m1"
git clone https://github.com/Himanshucc01/inventory-system.git

cd inventory-system

copy .env.example .env

docker compose up --build
```

---

## Local URLs

### Frontend

```txt id="m8q4v2"
http://localhost:3000
```

### Backend API

```txt id="r5k1t8"
http://localhost:8000
```

### Swagger Docs

```txt id="x3w7n6"
http://localhost:8000/docs
```

---

## Docker Usage

### Pull Docker Image

```bash id="p7f2k9"
docker pull himxnshu001/inventory-backend
```

### Run Backend Container

```bash id="n4v8q1"
docker run -p 8000:8000 himxnshu001/inventory-backend
```

---

## Environment Variables

| Variable       | Description                           |
| -------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL database connection string |
| `SECRET_KEY`   | Backend secret key                    |
| `DEBUG`        | Debug mode                            |
| `VITE_API_URL` | Backend API URL for frontend          |

---

## Deployment

### Backend Deployment — Render

#### Root Directory

```txt id="g6p1x4"
backend
```

#### Build Command

```bash id="c9k3r7"
pip install -r requirements.txt
```

#### Start Command

```bash id="u2n8m5"
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### Frontend Deployment — Vercel

#### Root Directory

```txt id="j5w9q2"
frontend
```

#### Build Command

```bash id="b1x7m6"
npm run build
```

#### Output Directory

```txt id="d4v2k8"
dist
```

#### Frontend Environment Variable

```env id="q8m5r1"
VITE_API_URL=https://inventory-system-bvf7.onrender.com
```

---
