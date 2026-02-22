import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'bank.db'));

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

export default db;
