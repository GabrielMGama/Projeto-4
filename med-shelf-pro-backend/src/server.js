import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool, init } from './db.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// List with optional search & pagination
app.get('/api/medicines', async (req, res) => {
  const { q, page = 1, pageSize = 50 } = req.query;
  const limit = Math.max(1, Math.min(200, Number(pageSize) || 50));
  const offset = (Math.max(1, Number(page)||1) - 1) * limit;
  const params = [];
  let where = '';
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE name ILIKE $${params.length}`;
  }
  const rows = await pool.query(
    `SELECT * FROM medicines ${where} ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM medicines ${where}`, params);
  res.json({ items: rows.rows, total: count.rows[0].total, page: Number(page)||1, pageSize: limit });
});

// Get by id
app.get('/api/medicines/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM medicines WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// Create
app.post('/api/medicines', async (req, res) => {
  const { name, brand, dosage, quantity = 0, lot, expires_at, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { rows } = await pool.query(
    `INSERT INTO medicines (name, brand, dosage, quantity, lot, expires_at, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [name, brand, dosage, quantity, lot, expires_at || null, notes]
  );
  res.status(201).json(rows[0]);
});

// Update (partial)
app.patch('/api/medicines/:id', async (req, res) => {
  const id = req.params.id;
  const fields = ['name','brand','dosage','quantity','lot','expires_at','notes'];
  const sets = [];
  const values = [];
  fields.forEach((f) => {
    if (f in req.body) {
      values.push(req.body[f]);
      sets.push(`${f} = $${values.length}`);
    }
  });
  if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE medicines SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// Delete
app.delete('/api/medicines/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM medicines WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
init().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init DB:', e);
  process.exit(1);
});
