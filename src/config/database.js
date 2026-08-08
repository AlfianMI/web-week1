const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  max: config.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Check Database connectivity
 */
async function testDbConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time');
    client.release();
    console.log(`[DB] Connected successfully to PostgreSQL (${config.db.host}:${config.db.port}/${config.db.name})`);
    return { connected: true, time: res.rows[0].current_time };
  } catch (error) {
    console.error('[DB] Failed to connect to PostgreSQL:', error.message);
    return { connected: false, error: error.message };
  }
}

/**
 * Initialize database schema / tables if they don't exist
 */
async function initDbSchema() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('[DB] Schema initialized: "products" table ready');
  } catch (error) {
    console.error('[DB] Error initializing schema:', error.message);
  }
}

module.exports = {
  pool,
  testDbConnection,
  initDbSchema,
};
