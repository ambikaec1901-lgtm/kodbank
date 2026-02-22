import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// On Vercel (read-only filesystem) use /tmp; locally use the server folder
const IS_VERCEL = process.env.VERCEL === '1';
const DB_PATH = IS_VERCEL ? '/tmp/bank.db' : join(__dirname, 'bank.db');

const db = new Database(DB_PATH);

// Create KodUser table
db.exec(`
  CREATE TABLE IF NOT EXISTS KodUser (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT DEFAULT 'Customer',
    balance REAL DEFAULT 100000.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create UserToken table
db.exec(`
  CREATE TABLE IF NOT EXISTS UserToken (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ── Auto-seed demo users on Vercel (fresh DB each cold start) ─────────────────
if (IS_VERCEL) {
  const existing = db.prepare('SELECT count(*) as c FROM KodUser').get();
  if (existing.c === 0) {
    const demoUsers = [
      { uid: 'KOD001', username: 'ambika', password: 'ambika123', email: 'ambika@kodbank.com', phone: '9876543210', balance: 150000 },
      { uid: 'KOD002', username: 'demo', password: 'demo123', email: 'demo@kodbank.com', phone: '9876543211', balance: 100000 },
      { uid: 'KOD003', username: 'admin', password: 'admin123', email: 'admin@kodbank.com', phone: '9876543212', balance: 500000 },
    ];
    const insert = db.prepare(`
            INSERT OR IGNORE INTO KodUser (uid, username, password, email, phone, role, balance)
            VALUES (?, ?, ?, ?, ?, 'Customer', ?)
        `);
    for (const u of demoUsers) {
      const hashed = bcrypt.hashSync(u.password, 10);
      insert.run(u.uid, u.username, hashed, u.email, u.phone, u.balance);
    }
    console.log('✅ Demo users seeded for Vercel deployment');
  }
}

export default db;
