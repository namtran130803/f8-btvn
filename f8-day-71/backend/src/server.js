const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

app.use(cors());
app.use(express.json());

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(retries = 20) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Connected to MySQL');
      return;
    } catch (error) {
      console.error(`MySQL connection failed (${attempt}/${retries}): ${error.message}`);
      if (pool) {
        await pool.end().catch(() => {});
        pool = undefined;
      }
      await sleep(3000);
    }
  }

  throw new Error('Could not connect to MySQL');
}

function requireDb() {
  if (!pool) {
    const error = new Error('Database is not connected');
    error.statusCode = 500;
    throw error;
  }

  return pool;
}

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

app.get('/health', async (req, res) => {
  try {
    await requireDb().query('SELECT 1');
    res.status(200).json({ db: 'connected' });
  } catch (error) {
    res.status(500).json({ db: 'disconnected', error: error.message });
  }
});

app.get('/items', async (req, res) => {
  try {
    const [rows] = await requireDb().query(
      'SELECT id, name, created_at FROM items ORDER BY id DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/items', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

  if (!name) {
    return res.status(500).json({ error: 'Item name is required' });
  }

  try {
    const [result] = await requireDb().query('INSERT INTO items (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectWithRetry()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend listening on 0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
