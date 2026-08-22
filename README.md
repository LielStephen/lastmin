# LastMin Logistics Delivery Tracker

A last-mile logistics delivery tracking and fleet management platform built with React, Express, SQLite, and PostgreSQL DDL.

---

## Key Features

- **Dynamic Rate Engine (Strategy Pattern)**: Computes shipping charges using volumetric weight `(L x W x H / 5000)` and configurable rate cards for B2B and B2C clients.
- **Geospatial Auto-Assignment (Haversine Formula)**: Calculates real-time distance between order pickup coordinates and active couriers to dispatch the nearest available agent.
- **Strict State Machine Matrix**: Enforces sequential lifecycle transitions (`Created` -> `Assigned` -> `Picked Up` -> `In Transit` -> `Out for Delivery` -> `Delivered` / `Failed`).
- **Immutable Tracking Ledger**: DB triggers log every status transition with actor IDs and ISO timestamps.
- **Kibo UI Delivery Comparison**: Composable React component comparing service tiers and rate cards.
- **Interactive Vector GIS Map**: Live SVG visualizer rendering pickup points, active agent positions, and destinations.

---

## Quick Start

### Installation

```bash
git clone https://github.com/LielStephen/lastmin.git
cd lastmin
npm install
```

### Local Development & Production Server

```bash
# Build React static assets and start Express server
npm run build
npm start
```

Access the portal live at `http://localhost:5000`.

### Run Automated System Tests

```bash
npm test
```

Verifies the Rate Engine, Haversine geospatial auto-assignment, and State Machine matrix rules.

---

## Demo Evaluator Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@lastmin.com` | `password123` | Global matrix control, Haversine auto-dispatch, rate card configuration |
| **Customer (B2C)** | `customer@lastmin.com` | `password123` | Order creation, Kibo UI tier selector, live tracking timeline |
| **Customer (B2B)** | `b2b@company.com` | `password123` | Corporate rate card order placement |
| **Delivery Agent** | `agent1@lastmin.com` | `password123` | Courier task matrix, GPS position broadcaster, status updates |

---

## Repository Structure

```
├── server/
│   ├── controllers/      # Express route controllers (orders, auth, agents, rates, zones)
│   ├── db/               # PostgreSQL schema.sql and SQLite database initializer/seeder
│   ├── middleware/       # JWT authentication and RBAC authorization
│   ├── routes/           # API endpoint router definitions
│   ├── services/         # Rate Engine, Geospatial Haversine, State Machine, Notifications
│   └── tests/            # Automated test suite
├── src/
│   ├── components/       # Kibo UI comparison, Interactive Map, Timeline, Modals
│   ├── context/          # Auth context state provider
│   ├── pages/            # Customer, Agent, and Admin portal dashboards
│   ├── App.jsx           # Main React layout container
│   └── index.css         # Styling system and status badges
├── render.yaml           # Render Blueprint deployment specification
├── vercel.json           # Vercel deployment configuration
└── package.json          # Package manifest and npm scripts
```

---

## Deployment

Configured for one-click deployment on Render using [`render.yaml`](file:///e:/lastmin/lastmin/render.yaml) or Vercel using [`vercel.json`](file:///e:/lastmin/lastmin/vercel.json).
