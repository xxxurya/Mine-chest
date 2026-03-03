const pool = require('../../config/db');

/**
 * Get task statistics - counts by status
 * Uses efficient COUNT with GROUP BY
 */
async function getTaskStats() {
  const query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM tasks
    GROUP BY status
    ORDER BY status
  `;
  
  const result = await pool.query(query);
  
  // Transform into a more usable format
  const stats = {
    total: 0,
    byStatus: {}
  };
  
  result.rows.forEach(row => {
    stats.byStatus[row.status] = parseInt(row.count, 10);
    stats.total += parseInt(row.count, 10);
  });
  
  return stats;
}

/**
 * Get approval/request statistics - counts by status
 * Uses efficient COUNT with GROUP BY
 */
async function getApprovalStats() {
  const query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM requests
    GROUP BY status
    ORDER BY status
  `;
  
  const result = await pool.query(query);
  
  // Transform into a more usable format
  const stats = {
    total: 0,
    byStatus: {}
  };
  
  result.rows.forEach(row => {
    stats.byStatus[row.status] = parseInt(row.count, 10);
    stats.total += parseInt(row.count, 10);
  });
  
  return stats;
}

/**
 * Get detailed task statistics with additional metrics
 */
async function getDetailedTaskStats() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as created_last_7_days,
      COUNT(CASE WHEN updated_at >= NOW() - INTERVAL '7 days' THEN 1 END) as updated_last_7_days
    FROM tasks
  `;
  
  const result = await pool.query(query);
  return result.rows[0];
}

/**
 * Get detailed approval statistics with additional metrics
 */
async function getDetailedApprovalStats() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as created_last_7_days,
      COUNT(CASE WHEN updated_at >= NOW() - INTERVAL '7 days' THEN 1 END) as processed_last_7_days
    FROM requests
  `;
  
  const result = await pool.query(query);
  return result.rows[0];
}

module.exports = {
  getTaskStats,
  getApprovalStats,
  getDetailedTaskStats,
  getDetailedApprovalStats,
};
