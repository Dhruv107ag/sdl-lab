const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to persistent SQLite database file
const dbDirectory = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.join(dbDirectory, 'complaints.sqlite');

// Initialize database instance
const db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enforce foreign key constraints and enable WAL mode for performance & concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

console.log(`[Database] SQLite connected at ${dbPath}`);
console.log(`[Database] Foreign keys enabled: ${db.pragma('foreign_keys', { simple: true }) === 1}`);

module.exports = db;
