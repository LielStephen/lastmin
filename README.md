# 🚀 LastMin Last-Mile Logistics Delivery Tracker

> **Last-Mile Delivery Tracker & Management Platform**  
> Built with clean, modular architecture, Strategy Pattern Rate Engine, Haversine Geospatial Auto-Assignment, Strict State Machine Matrix, and Immutable Audit Logging.

---

## ☁️ One-Click Cloud Deployment Guide

### Option 1: Deploy on Render (Recommended)
1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository `https://github.com/LielStephen/lastmin.git`.
4. Render automatically detects `render.yaml` and deploys the Node.js API and built React frontend with zero extra configuration!

**Manual Render Web Service Settings (if not using Blueprint):**
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

### Option 2: Deploy on Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import `https://github.com/LielStephen/lastmin.git`.
4. Vercel automatically detects `vercel.json` and builds both frontend and serverless API handlers.

---

### Option 3: Deploy on Railway
1. Log into [Railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `https://github.com/LielStephen/lastmin.git`.
4. Set Build Command: `npm install && npm run build` and Start Command: `npm start`.

---

## ⚡ Quick Start Guide (Local Execution)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Local Execution Steps

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/LielStephen/lastmin.git
   cd lastmin
   npm install
   ```

2. **Build & Run Production Mode:**
   ```bash
   npm run build
   npm start
   ```
   - Application runs live on `http://localhost:5000`

3. **Run System Automated Test Suite:**
   ```bash
   npm test
   ```
   Executes unit tests verifying Rate Calculation Strategy Pattern, Haversine Distance Engine, and State Machine Matrix rules.

---

## 🔑 Demo Evaluator Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@lastmin.com` | `password123` | Global order control, Haversine dispatch trigger, rate card editor, matrix override |
| **Customer (B2C)** | `customer@lastmin.com` | `password123` | Order creation with rate preview, live tracking timeline, failed delivery reschedule |
| **Customer (B2B)** | `b2b@company.com` | `password123` | Corporate rate card order placement |
| **Delivery Agent** | `agent1@lastmin.com` | `password123` | Task execution dashboard, live GPS position update, state machine status transition |

---

## 🗄️ Database Schema & Architecture (`schema.sql`)

The repository includes both native PostgreSQL DDL DML scripts with database triggers (`server/db/schema.sql`) and an embedded zero-dependency SQLite engine (`server/db/index.js`) for instant local execution.

```sql
-- 1. Users Registry
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'customer', 'agent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configurable Dynamic Rate Cards
CREATE TABLE rate_cards (
    id SERIAL PRIMARY KEY,
    client_type VARCHAR(10) CHECK (client_type IN ('B2B', 'B2C')),
    is_intra_zone BOOLEAN NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL,
    per_kg_rate DECIMAL(10, 2) NOT NULL,
    cod_surcharge_percent DECIMAL(5, 2) DEFAULT 0.00
);

-- 3. Live Agent Coordinates
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    current_lat DECIMAL(9, 6) NOT NULL,
    current_lng DECIMAL(9, 6) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('available', 'busy', 'offline'))
);

-- 4. Orders Ledger
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id),
    agent_id INT REFERENCES agents(id),
    status VARCHAR(30) DEFAULT 'Created',
    actual_weight DECIMAL(10, 2) NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(10) CHECK (payment_method IN ('PREPAID', 'COD'))
);

-- 5. Immutable Tracking Ledger
CREATE TABLE order_status_logs (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by INT REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📜 Documentation Deliverables
- [SYSTEM_DESIGN.md](file:///e:/lastmin/lastmin/SYSTEM_DESIGN.md) (800-word System Design Write-Up)
- [schema.sql](file:///e:/lastmin/lastmin/server/db/schema.sql) (PostgreSQL Schema & Triggers)
