# InvenTrack — Inventory & Order Management System

A full-stack, production-ready Inventory & Order Management System built with:

- **Backend**: FastAPI (Python) + PostgreSQL + SQLAlchemy
- **Frontend**: React + Vite + Tailwind CSS
- **Infrastructure**: Docker + Docker Compose

---

## Features

- **Products**: Create, read, update, delete products with unique SKU enforcement
- **Customers**: Manage customers with unique email enforcement
- **Orders**: Place orders with automatic inventory validation and stock reduction
- **Inventory**: Real-time stock tracking; orders blocked when stock is insufficient
- **Order Management**: Update order status (pending → confirmed → shipped → delivered / cancelled)
- **Stock Restoration**: Cancelling an order automatically restores product stock
- **Dashboard**: Live stats — total products, customers, orders, revenue, low-stock alerts

---

## Business Rules

| Rule | Description |
|------|-------------|
| Unique SKU | No two products can share a SKU |
| Unique Email | No two customers can share an email address |
| Stock Validation | Orders are rejected if any item's requested quantity exceeds available stock |
| Automatic Stock Reduction | Stock is reduced immediately when an order is placed |
| Stock Restoration | Cancelling or deleting an order restores all reserved stock |
| Low Stock Alert | Products with ≤ 10 units are flagged in the dashboard |

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker ≥ 24.x
- Docker Compose ≥ 2.x

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventory-system

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start all services
docker compose up --build

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password (**change in production**) |
| `POSTGRES_DB` | `inventory_db` | Database name |
| `SECRET_KEY` | `changeme` | App secret key (**change in production**) |
| `DEBUG` | `false` | Enable debug mode |

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products (supports `?search=`, `?category=`) |
| POST | `/api/products/` | Create a product |
| GET | `/api/products/{id}` | Get a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/products/low-stock` | Products with stock ≤ threshold |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/` | List all customers (supports `?search=`) |
| POST | `/api/customers/` | Create a customer |
| GET | `/api/customers/{id}` | Get a customer |
| PUT | `/api/customers/{id}` | Update a customer |
| DELETE | `/api/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List all orders (supports `?status=`, `?customer_id=`) |
| POST | `/api/orders/` | Create an order (validates + reduces stock) |
| GET | `/api/orders/{id}` | Get an order with items |
| PUT | `/api/orders/{id}` | Update order status |
| DELETE | `/api/orders/{id}` | Delete an order (restores stock) |
| GET | `/api/orders/stats` | Dashboard statistics |

Interactive API docs: `http://localhost:8000/docs`

---

## Deployment

### Backend (Render / Railway / Fly.io)
1. Connect your GitHub repository
2. Set environment variables from `.env.example`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel / Netlify)
1. Connect your GitHub repository, set root to `frontend/`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to your backend's public URL

### Database
Use a managed PostgreSQL service (Render Postgres, Supabase, Neon, Railway Postgres) and supply the connection string via `DATABASE_URL`.

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI app entry
│   ├── config.py        # Settings via env vars
│   ├── database.py      # SQLAlchemy engine & session
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── routers/
│   │   ├── products.py
│   │   ├── customers.py
│   │   └── orders.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   └── utils/
│   │       └── api.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## License

MIT
