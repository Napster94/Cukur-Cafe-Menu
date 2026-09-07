import path from 'path';

// Every host is different about where a persistent volume gets mounted, so
// this is the one place that decides where durable data lives. Point
// DATA_DIR at your platform's mounted volume (see README's deployment
// section) and both the database and uploaded images live inside it.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');

export const DB_PATH = process.env.DATABASE_FILE || path.join(DATA_DIR, 'dev.db');

export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads', 'menu-items');
