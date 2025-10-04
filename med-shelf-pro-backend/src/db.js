import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL ||
  `postgres://${process.env.PGUSER||'postgres'}:${process.env.PGPASSWORD||''}@${process.env.PGHOST||'localhost'}:${process.env.PGPORT||5432}/${process.env.PGDATABASE||'medshelf'}`;

export const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSL === '1' ? { rejectUnauthorized: false } : false });

export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS medicines (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      dosage TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      lot TEXT,
      expires_at DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
    CREATE INDEX IF NOT EXISTS idx_medicines_expires ON medicines(expires_at);
  `);
}
