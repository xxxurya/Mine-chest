const pool = require('../../config/db');

async function getAuditLogsByEntity(entityType, entityId) {
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
  return result.rows;
}

async function getAllAuditLogs(limit = 100) {
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
  return result.rows;
}

module.exports = {
  getAuditLogsByEntity,
  getAllAuditLogs,
};
