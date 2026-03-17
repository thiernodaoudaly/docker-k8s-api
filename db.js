const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRESQL_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
    });

/**
 * Wait for the database to be reachable before the app starts.
 * Railway Postgres can take a few seconds to wake up on first deploy.
 * Retries up to `maxRetries` times with exponential backoff.
 */
async function waitForDatabase(maxRetries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Database connection established.');
      return;
    } catch (err) {
      console.warn(`DB not ready (attempt ${attempt}/${maxRetries}): ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error('Could not connect to the database after multiple retries.');
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
  waitForDatabase,
};