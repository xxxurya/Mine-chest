const pool = require('../../config/db');
const { getAuditLogsByEntity } = require('../audit/audit.model');

async function createTask(title, description, assigned_to, assigned_by) {
  const query = `
    INSERT INTO tasks (id, title, description, assigned_to, assigned_by, status, created_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', NOW())
    RETURNING id
  `;
  const values = [title, description, assigned_to, assigned_by];
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

async function getTaskById(taskId) {
  const query = 'SELECT * FROM tasks WHERE id = $1';
  const result = await pool.query(query, [taskId]);
  return result.rows[0];
}

async function getTaskDetailsWithAudit(taskId) {
  const taskQuery = 'SELECT * FROM tasks WHERE id = $1';
  const taskResult = await pool.query(taskQuery, [taskId]);
  const task = taskResult.rows[0];
  
  if (!task) {
    return null;
  }
  
  const auditLogs = await getAuditLogsByEntity('task', taskId);
  
  return {
    task,
    auditHistory: auditLogs
  };
}

async function getTasksByAssignee(userId, page = 1, limit = 10, searchQuery = null, sortBy = 'created_at', order = 'DESC') {
  const offset = (page - 1) * limit;
  
  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ['status', 'created_at', 'title', 'description'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  
  // Validate order
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  let query;
  let values;
  
  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    query = `
      SELECT * FROM tasks 
      WHERE assigned_to = $1 
      AND (title ILIKE $2 OR description ILIKE $2)
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $3 OFFSET $4
    `;
    values = [userId, searchPattern, limit, offset];
  } else {
    query = `
      SELECT * FROM tasks 
      WHERE assigned_to = $1 
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $2 OFFSET $3
    `;
    values = [userId, limit, offset];
  }
  
  const result = await pool.query(query, values);
  return result.rows;
}

async function getTotalTasksByAssignee(userId, searchQuery = null) {
  let query;
  let values;
  
  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    query = 'SELECT COUNT(*) as total FROM tasks WHERE assigned_to = $1 AND (title ILIKE $2 OR description ILIKE $2)';
    values = [userId, searchPattern];
  } else {
    query = 'SELECT COUNT(*) as total FROM tasks WHERE assigned_to = $1';
    values = [userId];
  }
  
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].total);
}

async function updateTaskStatus(taskId, status) {
  const query = 'UPDATE tasks SET status = $1 WHERE id = $2';
  await pool.query(query, [status, taskId]);
}

// Search tasks by title or description containing the search term
async function searchTasks(searchTerm, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM tasks 
    WHERE title ILIKE $1 OR description ILIKE $1
    ORDER BY created_at DESC 
    LIMIT $2 OFFSET $3
  `;
  const searchPattern = `%${searchTerm}%`;
  const result = await pool.query(query, [searchPattern, limit, offset]);
  return result.rows;
}

async function getTotalSearchTasks(searchTerm) {
  const query = `
    SELECT COUNT(*) as total FROM tasks 
    WHERE title ILIKE $1 OR description ILIKE $1
  `;
  const searchPattern = `%${searchTerm}%`;
  const result = await pool.query(query, [searchPattern]);
  return parseInt(result.rows[0].total);
}

module.exports = {
  createTask,
  getTaskById,
  getTaskDetailsWithAudit,
  getTasksByAssignee,
  getTotalTasksByAssignee,
  updateTaskStatus,
  searchTasks,
  getTotalSearchTasks,
};
