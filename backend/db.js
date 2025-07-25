const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./bank.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS loans (
    loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT,
    principal REAL,
    years INTEGER,
    rate REAL,
    total_amount REAL,
    emi REAL,
    interest REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER,
    amount REAL,
    payment_type TEXT, -- EMI or LUMP_SUM
    date TEXT,
    FOREIGN KEY(loan_id) REFERENCES loans(loan_id)
  )`);
});

module.exports = db;
