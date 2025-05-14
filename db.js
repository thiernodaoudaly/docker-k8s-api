const { Pool } = require('pg');
require('dotenv').config();

// Utiliser l'URL de connexion fournie par Railway
const connectionString = process.env.DATABASE_URL || process.env.POSTGRESQL_URL;

// Si l'URL de connexion est disponible, l'utiliser
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false 
      } : false
    })
  : 
    new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end()
};