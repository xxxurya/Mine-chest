const pool = require('../../config/db');
const logger = require('../../utils/logger');

async function getAuditLogsByEntity(entityType, entityId) {
  try {
    logger.debug('Fetching audit logs by entity from database', { entityType, entityId });
    const query = `
      SELECT
        al.id,
        al.entity_type,
        al.entity_id,
        al.action,
        al.user_id,
        al.details,
        al.timestamp,
        u.username as user_username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = $1 AND al.entity_id = $2
      ORDER BY al.timestamp DESC
    `;

    const result = await pool.query(query, [entityType, entityId]);
    logger.debug('Audit logs fetched from database', { entityType, entityId, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error fetching audit logs by entity', { entityType, entityId, error: error.message });
    throw error;
  }
}

async function getAllAuditLogs(limit = 100) {
  try {
    logger.debug('Fetching all audit logs from database', { limit });
    const query = `
      SELECT
        al.id,
        al.entity_type,
        al.entity_id,
        al.action,
        al.user_id,
        al.details,
        al.timestamp,
        u.username as user_username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    logger.debug('All audit logs fetched from database', { count: result.rows.length, limit });
    return result.rows;
  } catch (error) {
    logger.error('Error fetching all audit logs', { limit, error: error.message });
    throw error;
  }
}

module.exports = {
  getAuditLogsByEntity,
  getAllAuditLogs,
};
