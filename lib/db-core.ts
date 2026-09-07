import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DB_PATH } from './paths';

const globalForDb = globalThis as unknown as { __cukurDb?: Database.Database };

function createConnection() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export const rawDb = globalForDb.__cukurDb ?? createConnection();
if (process.env.NODE_ENV !== 'production') globalForDb.__cukurDb = rawDb;

rawDb.exec(`
CREATE TABLE IF NOT EXISTS Admin (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS MenuItem (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  popular INTEGER NOT NULL DEFAULT 0,
  isNew INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  categoryId TEXT NOT NULL REFERENCES Category(id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS DietaryTag (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Allergen (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS MenuItemDietaryTag (
  menuItemId TEXT NOT NULL REFERENCES MenuItem(id) ON DELETE CASCADE,
  dietaryTagId TEXT NOT NULL REFERENCES DietaryTag(id) ON DELETE CASCADE,
  PRIMARY KEY (menuItemId, dietaryTagId)
);

CREATE TABLE IF NOT EXISTS MenuItemAllergen (
  menuItemId TEXT NOT NULL REFERENCES MenuItem(id) ON DELETE CASCADE,
  allergenId TEXT NOT NULL REFERENCES Allergen(id) ON DELETE CASCADE,
  PRIMARY KEY (menuItemId, allergenId)
);

CREATE TABLE IF NOT EXISTS CafeSettings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Çukur Café',
  tagline TEXT DEFAULT 'Good Drinks, Good Food, Good Mood',
  logoUrl TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  hours TEXT,
  instagram TEXT,
  facebook TEXT,
  currency TEXT NOT NULL DEFAULT '$'
);

CREATE INDEX IF NOT EXISTS idx_menuitem_category ON MenuItem(categoryId);
`);
