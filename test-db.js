import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('Testing connection...');

pool.query('SELECT id, title, organization, period, description, type, image, start_date FROM experiences ORDER BY start_date DESC')
  .then(result => {
    console.log('Success! Rows:', result.rows.length);
    console.log(result.rows);
  })
  .catch(err => {
    console.error('Error:', err.message);
    console.error('Full error:', err);
  })
  .finally(() => pool.end());
