// config/database.js

const { Pool } = require("pg");

require("dotenv").config();

/**
 * -------------- DATABASE CONNECTION ----------------
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * -------------- EXPORTS ----------------
 */

module.exports = pool;
