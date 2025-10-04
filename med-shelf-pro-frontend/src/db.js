import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');

export const db = new Database(dbPath);

export function init() {
  db.pragma('journal_mode = WAL');
  db.prepare(`CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    dosage TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    lot TEXT,
    expires_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_medicines_expires ON medicines(expires_at)').run();
}
