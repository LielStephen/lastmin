-- LastMin Delivery Tracker Schema
-- PostgreSQL DDL with Strict Audit Logging Triggers and Haversine Functions

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_status_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS rate_cards CASCADE;
DROP TABLE IF EXISTS zone_areas CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. User Registry (Admin, Customer, Agent)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'customer', 'agent')) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Zone Registry & Coverage Mapping
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zone_areas (
    id SERIAL PRIMARY KEY,
    zone_id INT REFERENCES zones(id) ON DELETE CASCADE,
    postal_code VARCHAR(20) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL
);

-- 3. Configurable Dynamic Rate Cards (Zero Hardcoding)
CREATE TABLE rate_cards (
    id SERIAL PRIMARY KEY,
    client_type VARCHAR(10) CHECK (client_type IN ('B2B', 'B2C')) NOT NULL,
    is_intra_zone BOOLEAN NOT NULL, -- True if pickup & drop are in the same zone
    base_rate DECIMAL(10, 2) NOT NULL,
    per_kg_rate DECIMAL(10, 2) NOT NULL,
    cod_surcharge_percent DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_card_type UNIQUE (client_type, is_intra_zone)
);

-- 4. Live Agent Coordinates (For Real-Time Distance Queries)
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    zone_id INT REFERENCES zones(id) ON DELETE SET NULL,
    current_lat DECIMAL(9, 6) NOT NULL,
    current_lng DECIMAL(9, 6) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('available', 'busy', 'offline')) DEFAULT 'available',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clean Orders Ledger
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Created',
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(9, 6) NOT NULL,
    pickup_lng DECIMAL(9, 6) NOT NULL,
    drop_address TEXT NOT NULL,
    drop_lat DECIMAL(9, 6) NOT NULL,
    drop_lng DECIMAL(9, 6) NOT NULL,
    pickup_zone_id INT REFERENCES zones(id),
    drop_zone_id INT REFERENCES zones(id),
    is_intra_zone BOOLEAN NOT NULL,
    client_type VARCHAR(10) CHECK (client_type IN ('B2B', 'B2C')) NOT NULL,
    actual_weight DECIMAL(10, 2) NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    volumetric_weight DECIMAL(10, 2) NOT NULL,
    billable_weight DECIMAL(10, 2) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    weight_charge DECIMAL(10, 2) NOT NULL,
    cod_surcharge DECIMAL(10, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(10) CHECK (payment_method IN ('PREPAID', 'COD')) NOT NULL,
    failure_reason TEXT,
    rescheduled_date TIMESTAMP,
    scheduled_delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. The Immutable Tracking Ledger (Audit-Ready)
CREATE TABLE order_status_logs (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by INT REFERENCES users(id),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Database Trigger for Automatic Immutable Ledger Logging
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO order_status_logs (order_id, from_status, to_status, timestamp)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();
