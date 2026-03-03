const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const auditLog = async (userId, action) => {
  try {
    await pool.query('INSERT INTO audit_logs (user_id, action, timestamp) VALUES ($1, $2, NOW())', [userId, action]);
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

const auditMiddleware = (req, res, next) => {
  if (req.user) {
    const action = `${req.method} ${req.path}`;
    auditLog(req.user.id, action);
  }
  next();
};

module.exports = auditMiddleware;
