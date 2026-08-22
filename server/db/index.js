// SQLite Database Adapter for LastMin Delivery Tracker
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'lastmin.sqlite')
const db = new sqlite3.Database(dbPath)

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON')

export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

export const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export const initDbSchema = async () => {
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK (role IN ('admin', 'customer', 'agent')) NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS zone_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
      postal_code TEXT NOT NULL,
      area_name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_type TEXT CHECK (client_type IN ('B2B', 'B2C')) NOT NULL,
      is_intra_zone INTEGER NOT NULL,
      base_rate REAL NOT NULL,
      per_kg_rate REAL NOT NULL,
      cod_surcharge_percent REAL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(client_type, is_intra_zone)
    );

    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
      current_lat REAL NOT NULL,
      current_lng REAL NOT NULL,
      status TEXT CHECK (status IN ('available', 'busy', 'offline')) DEFAULT 'available',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'Created',
      pickup_address TEXT NOT NULL,
      pickup_lat REAL NOT NULL,
      pickup_lng REAL NOT NULL,
      drop_address TEXT NOT NULL,
      drop_lat REAL NOT NULL,
      drop_lng REAL NOT NULL,
      pickup_zone_id INTEGER REFERENCES zones(id),
      drop_zone_id INTEGER REFERENCES zones(id),
      is_intra_zone INTEGER NOT NULL,
      client_type TEXT CHECK (client_type IN ('B2B', 'B2C')) NOT NULL,
      actual_weight REAL NOT NULL,
      length REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      volumetric_weight REAL NOT NULL,
      billable_weight REAL NOT NULL,
      base_price REAL NOT NULL,
      weight_charge REAL NOT NULL,
      cod_surcharge REAL DEFAULT 0.00,
      final_price REAL NOT NULL,
      payment_method TEXT CHECK (payment_method IN ('PREPAID', 'COD')) NOT NULL,
      failure_reason TEXT,
      rescheduled_date DATETIME,
      scheduled_delivery_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_status_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_by INTEGER REFERENCES users(id),
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `

  return new Promise((resolve, reject) => {
    db.exec(createTablesSql, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export default db
