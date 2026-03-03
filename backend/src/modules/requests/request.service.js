const pool = require('../../config/db');
const logger = require('../../utils/logger');

async function createRequest(type, title, description, requestedBy, metadata = {}) {
  try {
    logger.debug('Creating request in database', { type, title, requestedBy });
    const query = `
      INSERT INTO requests (id, type, title, description, requested_by, status, metadata, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', $5, NOW())
      RETURNING id, type, title, description, requested_by, status, metadata, created_at
    `;

    const result = await pool.query(query, [type, title, description, requestedBy, JSON.stringify(metadata)]);
    logger.debug('Request created in database', { requestId: result.rows[0].id });
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating request', { type, title, requestedBy, error: error.message });
    throw error;
  }
}

async function getRequests(status = null) {
  try {
    let query = 'SELECT * FROM requests';
    const values = [];

    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';

    logger.debug('Fetching requests from database', { status });
    const result = await pool.query(query, values);
    logger.debug('Requests fetched from database', { count: result.rows.length, status });
    return result.rows;
  } catch (error) {
    logger.error('Error fetching requests', { status, error: error.message });
    throw error;
  }
}

async function getRequestById(requestId) {
  try {
    logger.debug('Fetching request by ID from database', { requestId });
    const result = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);
    const request = result.rows[0] || null;
    logger.debug('Request fetched from database', { requestId, found: !!request });
    return request;
  } catch (error) {
    logger.error('Error fetching request by ID', { requestId, error: error.message });
    throw error;
  }
}

async function approveRequest(requestId, approvedBy) {
  try {
    logger.debug('Approving request in database', { requestId, approvedBy });
    const query = `
      UPDATE requests
      SET status = 'APPROVED', approved_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [requestId, approvedBy]);
    logger.debug('Request approved in database', { requestId, approvedBy });
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error approving request', { requestId, approvedBy, error: error.message });
    throw error;
  }
}

async function rejectRequest(requestId, rejectedBy, reason) {
  try {
    logger.debug('Rejecting request in database', { requestId, rejectedBy, reason });
    const query = `
      UPDATE requests
      SET status = 'REJECTED', rejected_by = $2, rejection_reason = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [requestId, rejectedBy, reason]);
    logger.debug('Request rejected in database', { requestId, rejectedBy });
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error rejecting request', { requestId, rejectedBy, reason, error: error.message });
    throw error;
  }
}

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
};
