# LastMin — Logistics Delivery Tracker

LastMin is a full-stack last-mile delivery management platform designed to handle order creation, delivery assignment, pricing, courier tracking, and delivery status management.

The project uses **React** for the frontend and **Express.js** for the backend, with SQLite for local development and a PostgreSQL schema for production-oriented deployments.

## Features

### Dynamic Rate Engine

Shipping costs are calculated using package dimensions and configurable rate cards.

* Volumetric weight calculation:
  `L × W × H / 5000`
* Supports different pricing rules for B2B and B2C customers
* Rate calculation is implemented using the Strategy Pattern
* Rate cards can be configured by administrators

### Automatic Courier Assignment

LastMin uses the **Haversine formula** to calculate the distance between a pickup location and available delivery agents.

The system can then assign an order to the nearest active courier.

### Delivery State Machine

Orders follow a controlled delivery lifecycle:

```text
Created
   ↓
Assigned
   ↓
Picked Up
   ↓
In Transit
   ↓
Out for Delivery
   ↓
Delivered / Failed
```

Invalid state transitions are rejected by the backend, preventing inconsistent order states.

### Tracking Ledger

Delivery status changes are recorded in an immutable tracking history.

Each transition records information such as:

* Previous status
* New status
* Actor/user responsible for the change
* Timestamp

Database triggers are used to maintain the tracking history.

### Delivery Comparison UI

The React frontend includes a service comparison interface that allows customers to compare available delivery tiers and their corresponding rates.

### Interactive Delivery Map

The application includes an SVG-based map interface for visualizing:

* Pickup locations
* Delivery destinations
* Active courier positions
* Delivery routes and assignments

## Tech Stack

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| Frontend          | React                         |
| Backend           | Node.js, Express.js           |
| Database          | SQLite                        |
| Production Schema | PostgreSQL                    |
| Authentication    | JWT                           |
| Authorization     | Role-Based Access Control     |
| Mapping           | SVG / Geospatial calculations |
| Testing           | Automated Node.js test suite  |
| Deployment        | Render / Vercel               |

## Project Structure

```text
lastmin/
├── server/
│   ├── controllers/
│   │   ├── orders/
│   │   ├── auth/
│   │   ├── agents/
│   │   ├── rates/
│   │   └── zones/
│   │
│   ├── db/
│   │   ├── schema.sql
│   │   └── SQLite initialization/seeding
│   │
│   ├── middleware/
│   │   ├── authentication
│   │   └── authorization
│   │
│   ├── routes/
│   ├── services/
│   │   ├── rate engine
│   │   ├── geospatial assignment
│   │   ├── state machine
│   │   └── notifications
│   │
│   └── tests/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   └── index.css
│
├── render.yaml
├── vercel.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git

### Clone the Repository

```bash
git clone https://github.com/LielStephen/lastmin.git
cd lastmin
```

### Install Dependencies

```bash
npm install
```

### Run in Development

Start the application using the project's development script:

```bash
npm run dev
```

The exact local URL will be printed in your terminal when the development server starts.

> `localhost` is only for local development. It is not the production URL.

### Build and Run

To create a production build and run the Express server:

```bash
npm run build
npm start
```

The application will normally be available at:

```text
http://localhost:5000
```

This address is local to your computer and is **not accessible to other users on the internet** unless you explicitly expose or deploy the application.

## Testing

Run the automated test suite with:

```bash
npm test
```

The tests cover the core business logic, including:

* Rate calculation
* Volumetric weight
* Haversine distance calculation
* Courier assignment
* Delivery state transitions

## Demo Accounts

The repository includes demo accounts for testing the different roles in the application.

| Role                 | Email                  | Password      |
| -------------------- | ---------------------- | ------------- |
| System Administrator | `admin@lastmin.com`    | `password123` |
| B2C Customer         | `customer@lastmin.com` | `password123` |
| B2B Customer         | `b2b@company.com`      | `password123` |
| Delivery Agent       | `agent1@lastmin.com`   | `password123` |

**Note:** These credentials are intended only for local/demo environments. Do not use them in a production deployment.

## User Roles

### Administrator

Administrators can:

* Configure delivery rate cards
* Manage delivery rules
* Monitor orders
* Manage courier assignment
* Control the delivery state machine

### Customer

Customers can:

* Create delivery orders
* Select delivery services
* View calculated shipping charges
* Track their deliveries

### B2B Customer

B2B customers can place orders using the configured corporate rate cards.

### Delivery Agent

Delivery agents can:

* View assigned deliveries
* Update delivery status
* Broadcast their current position
* Manage their assigned delivery tasks

## Architecture

The application follows a layered full-stack architecture:

```text
React Frontend
      │
      ▼
Express REST API
      │
      ├── Authentication / JWT
      ├── RBAC Authorization
      ├── Order Management
      ├── Rate Engine
      ├── Courier Assignment
      └── Delivery State Machine
      │
      ▼
Database
(SQLite / PostgreSQL)
```

Business logic is separated into backend services rather than being placed directly inside route handlers.

## Geospatial Assignment

Courier assignment uses the Haversine formula to estimate the great-circle distance between two geographic coordinates.

For a pickup location `(lat₁, lon₁)` and courier location `(lat₂, lon₂)`, the system calculates the distance and uses it to determine the nearest available courier.

This makes the assignment process independent of a specific map provider.

## Delivery State Management

The backend enforces valid delivery transitions rather than allowing clients to arbitrarily change an order's status.

For example:

```text
Created → Assigned
Assigned → Picked Up
Picked Up → In Transit
In Transit → Out for Delivery
Out for Delivery → Delivered
Out for Delivery → Failed
```

An invalid transition is rejected by the state machine.

## Deployment

The repository contains deployment configuration for cloud hosting.

### Render

The project includes:

```text
render.yaml
```

which can be used to configure a Render deployment.

### Vercel

The repository also contains:

```text
vercel.json
```

for Vercel deployment configuration.

The production URL depends on the hosting provider and the deployment configuration. **Do not document `localhost` as the production/demo URL.**

After deployment, replace the deployment URL in your project documentation with the actual URL generated by Render or Vercel.

## Why I Built This

Last-mile delivery involves several problems that are easy to oversimplify: pricing, courier assignment, delivery state management, and tracking history.

LastMin was built as a practical implementation of these concepts in a single system, with particular attention to backend business logic and the consistency of delivery state transitions.

## License

This project is intended for educational and demonstration purposes.
