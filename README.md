# InvenTrack — Inventory & Order Management System

A full-stack, production-ready Inventory & Order Management System built with:

* **Backend**: FastAPI (Python) + PostgreSQL + SQLAlchemy
* **Frontend**: React + Vite + Tailwind CSS
* **Infrastructure**: Docker + Docker Compose

---

## Features

* **Products**: Create, read, update, delete products with unique SKU enforcement
* **Customers**: Manage customers with unique email enforcement
* **Orders**: Place orders with automatic inventory validation and stock reduction
* **Inventory**: Real-time stock tracking; orders blocked when stock is insufficient
* **Order Management**: Update order status (pending → confirmed → shipped → delivered / cancelled)
* **Stock Restoration**: Cancelling an order automatically restores product stock
* **Dashboard**: Live stats — total products, customers, orders, revenue, low-stock alerts

---

## Business Rules

| Rule                      | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| Unique SKU                | No two products can share a SKU                                              |
| Unique Email              | No two customers can share an email address                                  |
| Stock Validation          | Orders are rejected if any item's requested quantity exceeds available stock |
| Automatic Stock Reduction | Stock is reduced immediately when an order is placed                         |
| Stock Restoration         | Cancelling or deleting an order restores all reserved stock                  |
| Low Stock Alert           | Products with ≤ 10 units are flagged in the dashboard                        |

---

## Quick Start (Docker Compose)

### Prerequisites

* Docker ≥ 24.x
* Docker Compose ≥ 2.x

### Steps

```bash id="n7q2w5"
# 1. Clone the repository
git clone https://github.com/Himanshucc01/inventory-system.git
cd inventory-system

# 2. Copy and configure environment
copy .env.example .env

# 3. Start all services
docker compose up --build
```

# 4. Open the app

Frontend:

```txt id="f4m8p2"
http://localhost:3000
```

Backend API:

```txt id="x7r1n6"
http://localhost:8000
```

API Docs:

```txt id="k5w9q3"
http://localhost:8000/docs
```

---

## Environment Variables

| Variable            | Default        | Description         |
| ------------------- | -------------- | ------------------- |
| `POSTGRES_USER`     | `postgres`     | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres`     | PostgreSQL password |
| `POSTGRES_DB`       | `inventory_db` | Database name       |
| `SECRET_KEY`        | `changeme`     | App secret key      |
| `DEBUG`             | `false`        | Enable debug mode   |

---

## API Reference

### Products

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/api/products/`          | List all products               |
| POST   | `/api/products/`          | Create a product                |
| GET    | `/api/products/{id}`      | Get a product                   |
| PUT    | `/api/products/{id}`      | Update a product                |
| DELETE | `/api/products/{id}`      | Delete a product                |
| GET    | `/api/products/low-stock` | Products with stock ≤ threshold |

### Customers

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/customers/`     | List all customers |
| POST   | `/api/customers/`     | Create a customer  |
| GET    | `/api/customers/{id}` | Get a customer     |
| PUT    | `/api/customers/{id}` | Update a customer  |
| DELETE | `/api/customers/{id}` | Delete a customer  |

### Orders

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/orders/`      | List all orders         |
| POST   | `/api/orders/`      | Create an order         |
| GET    | `/api/orders/{id}`  | Get an order with items |
| PUT    | `/api/orders/{id}`  | Update order status     |
| DELETE | `/api/orders/{id}`  | Delete an order         |
| GET    | `/api/orders/stats` | Dashboard statistics    |

Interactive API docs:

```txt id="r3x8m1"
http://localhost:8000/docs
```

---

## Deployment

### Backend (Render)

1. Connect your GitHub repository
2. Set environment variables from `.env.example`
3. Build command:

```bash id="c9v2k7"
pip install -r requirements.txt
```

4. Start command:

```bash id="m4q8x1"
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)

1. Connect your GitHub repository, set root to `frontend/`
2. Build command:

```bash id="w7n5p3"
npm run build
```

3. Output directory:

```txt id="j2r9x4"
dist
```

4. Set environment variable:

```env id="u6k1m8"
VITE_API_URL=https://inventory-system-bvf7.onrender.com
```

### Database

Use a managed PostgreSQL service and supply the connection string via `DATABASE_URL`.

---

## Project Structure

```txt id="p8x3m5"
inventory-system/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# Live Links

### Live Frontend

https://inventory-system-ochre-six.vercel.app/dashboard

### Backend API

https://inventory-system-bvf7.onrender.com

### Swagger Documentation

https://inventory-system-bvf7.onrender.com/docs

### Docker Backend Image

https://hub.docker.com/r/himxnshu001/inventory-backend

---


