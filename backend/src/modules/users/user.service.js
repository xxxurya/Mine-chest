const pool = require('../../config/db');

async function createUser(username, hashedPassword, role) {
  const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id';
  const values = [username, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

async function getUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const query = 'SELECT id, username, role, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
};
