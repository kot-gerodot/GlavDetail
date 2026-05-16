const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT '',
      phone TEXT NOT NULL,
      vin_or_model TEXT DEFAULT '',
      source TEXT NOT NULL DEFAULT 'unknown',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  save();
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getAll() {
  return db.exec('SELECT * FROM leads ORDER BY created_at DESC');
}

function getById(id) {
  const stmt = db.prepare('SELECT * FROM leads WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const columns = stmt.getColumnNames();
    const values = stmt.get();
    stmt.free();
    const row = {};
    columns.forEach((col, i) => (row[col] = values[i]));
    return row;
  }
  stmt.free();
  return null;
}

function create({ name, phone, vin_or_model, source }) {
  const stmt = db.prepare(
    'INSERT INTO leads (name, phone, vin_or_model, source) VALUES (?, ?, ?, ?)',
  );
  stmt.run([name || '', phone, vin_or_model || '', source || 'unknown']);
  const id = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  stmt.free();
  save();
  return getById(id);
}

function remove(id) {
  const stmt = db.prepare('DELETE FROM leads WHERE id = ?');
  stmt.run([id]);
  stmt.free();
  save();
}

function parseResult(result) {
  if (!result || !result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => (obj[col] = row[i]));
    return obj;
  });
}

module.exports = { initDB, getAll: () => parseResult(getAll()), getById, create, remove };
