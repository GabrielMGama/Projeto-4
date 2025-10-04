import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { db, init } from './db.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// List with pagination & search
app.get('/api/medicines', (req, res) => {
  const { q = '', page = 1, pageSize = 20 } = req.query;
  const p = Math.max(parseInt(page), 1);
  const ps = Math.min(Math.max(parseInt(pageSize), 1), 100);
  const offset = (p - 1) * ps;
  const like = `%${q.toString().trim()}%`;
  const total = db.prepare(`SELECT COUNT(*) as c FROM medicines
    WHERE name LIKE ? OR brand LIKE ? OR notes LIKE ?`).get(like, like, like).c;
  const rows = db.prepare(`SELECT * FROM medicines
    WHERE name LIKE ? OR brand LIKE ? OR notes LIKE ?
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?`).all(like, like, like, ps, offset);
  res.json({ page: p, pageSize: ps, total, items: rows });
});

// Retrieve one
app.get('/api/medicines/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Create
app.post('/api/medicines', (req, res) => {
  const { name, brand = null, dosage = null, quantity = 0, lot = null, expires_at = null, notes = null } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Field "name" is required' });
  const now = new Date().toISOString();
  const info = db.prepare(`INSERT INTO medicines
    (name, brand, dosage, quantity, lot, expires_at, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(name.trim(), brand, dosage, Number(quantity)||0, lot, expires_at, notes, now, now);
  const created = db.prepare('SELECT * FROM medicines WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Update
app.put('/api/medicines/:id', (req, res) => {
  const { name, brand, dosage, quantity, lot, expires_at, notes } = req.body || {};
  const existing = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  db.prepare(`UPDATE medicines SET
    name = COALESCE(?, name),
    brand = COALESCE(?, brand),
    dosage = COALESCE(?, dosage),
    quantity = COALESCE(?, quantity),
    lot = COALESCE(?, lot),
    expires_at = COALESCE(?, expires_at),
    notes = COALESCE(?, notes),
    updated_at = ?
    WHERE id = ?`)
    .run(
      name ?? null,
      brand ?? null,
      dosage ?? null,
      (quantity !== undefined && quantity !== null) ? Number(quantity) : null,  // placeholder
      lot ?? null,
      expires_at ?? null,
      notes ?? null,
      now,
      req.params.id
    );
  const updated = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Patch (partial update)
app.patch('/api/medicines/:id', (req, res) => {
  const fields = ['name','brand','dosage','quantity','lot','expires_at','notes'];
  const set = [];
  const values = [];
  for (const f of fields) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, f)) {
      set.push(`${f} = ?`);
      if (f === 'quantity') {
        values.push(Number(req.body[f]));
      } else {
        values.push(req.body[f]);
      }
    }
  }
  if (set.length === 0) return res.status(400).json({ error: 'No fields to update' });
  set.push('updated_at = ?'); values.push(new Date().toISOString());
  values.push(req.params.id);
  const stmt = `UPDATE medicines SET ${set.join(', ')} WHERE id = ?`;
  const info = db.prepare(stmt).run(...values);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete
app.delete('/api/medicines/:id', (req, res) => {
  const info = db.prepare('DELETE FROM medicines WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
init();
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
