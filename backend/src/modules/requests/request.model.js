const pool = require('../../config/db');

async function createRequest(type, title, description, requestedBy, metadata = {}) {
  const query = `
    INSERT INTO requests (id, type, title, description, requested_by, status, metadata, created_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', $5, NOW())
    RETURNING id, type, title, description, requested_by, status, metadata, created_at
  `;
  const values = [type, title, description, requestedBy, JSON.stringify(metadata)];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getRequests(status = null) {
  let query = 'SELECT * FROM requests';
  let values = [];
  
  if (status) {
    query += ' WHERE status = $1';
    values.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, values);
  return result.rows;
}

async function getRequestById(requestId) {
  const query = 'SELECT * FROM requests WHERE id = $1';
  const result = await pool.query(query, [requestId]);
  return result.rows[0];
}

async function approveRequest(requestId, approvedBy) {
  const query = `
    UPDATE requests 
    SET status = 'APPROVED', approved_by = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [requestId, approvedBy]);
  return result.rows[0];
}

async function rejectRequest(requestId, rejectedBy, reason) {
  const query = `
    UPDATE requests 
    SET status = 'REJECTED', rejected_by = $2, rejection_reason = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [requestId, rejectedBy, reason]);
  return result.rows[0];
}

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
};
