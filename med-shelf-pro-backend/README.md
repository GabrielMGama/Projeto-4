# Med Shelf Pro — Backend (Express + SQLite)

A minimal backend to persist data for your Med Shelf Pro frontend.

## Endpoints

- `GET /api/health` — healthcheck
- `GET /api/medicines?q=&page=&pageSize=` — list with search & pagination
- `GET /api/medicines/:id` — get one
- `POST /api/medicines` — create `{ name, brand?, dosage?, quantity?, lot?, expires_at?, notes? }`
- `PUT /api/medicines/:id` — replace (any missing fields keep the previous value)
- `PATCH /api/medicines/:id` — partial update
- `DELETE /api/medicines/:id` — delete

All responses are JSON. CORS is enabled for `*` by default.

## Quickstart

```bash
cd med-shelf-pro-backend
npm install
npm run dev
# API on http://localhost:4000
```

## Connecting the Frontend

In your frontend API calls, point to `http://localhost:4000/api/medicines`. Example:

```js
const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const res = await fetch(`${base}/api/medicines`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Dipirona', dosage: '500mg', quantity: 20, expires_at: '2026-01-01' })
});
```

## Notes

- Uses SQLite file `data.sqlite` in the project folder (configurable via `DB_PATH`).  
- Production tip: put the DB file on a persistent disk.  
- You can later swap SQLite to Postgres with minimal changes.


---

## Observações para Windows (erros do `node-gyp` / `better-sqlite3`)

Se aparecer erro parecido com `node-gyp`/`Visual Studio` ou `EPERM` dentro do OneDrive, siga **uma** das opções:

### Opção A — Usar Node LTS 20 (recomendado)
1. Instale o **Node.js 20 LTS** (ou use `nvm` e rode `nvm install 20 && nvm use 20`).  
2. Mova o projeto para fora do OneDrive, ex.: `C:\dev\med-shelf-pro-backend`.  
3. No terminal:  
   ```bash
   rd /s /q node_modules  # (PowerShell: Remove-Item node_modules -Recurse -Force)
   npm cache clean --force
   npm install
   npm run dev
   ```

### Opção B — Instalar Build Tools (caso queira manter Node 22)
- Instale o **Visual Studio Build Tools 2022** com o workload **Desktop development with C++**.  
- Depois rode:  
  ```bash
  npm config set msvs_version 2022
  npm install
  ```

### Opção C — Docker (não precisa compilar nativo)
```bash
docker build -t med-shelf-pro-backend .
docker run -p 4000:4000 med-shelf-pro-backend
```

**Dica:** Erros `EPERM` ao remover pastas geralmente ocorrem quando o projeto está dentro do OneDrive. Mova para fora ou pause a sincronização.
