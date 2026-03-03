const pool = require('../../config/db');
const { getAuditLogsByEntity } = require('../audit/audit.service');
const logger = require('../../utils/logger');

async function createTask(title, description, assignedTo, assignedBy) {
  try {
    logger.debug('Executing createTask query', { title, assignedTo, assignedBy });
    const query = `
      INSERT INTO tasks (id, title, description, assigned_to, assigned_by, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', NOW())
      RETURNING id
    `;
    const result = await pool.query(query, [title, description, assignedTo, assignedBy]);
    logger.debug('Task created in database', { taskId: result.rows[0].id });
    return result.rows[0].id;
  } catch (error) {
    logger.error('Error creating task', { title, assignedTo, assignedBy, error: error.message });
    throw error;
  }
}

async function getTaskById(taskId) {
  try {
    logger.debug('Fetching task by ID from database', { taskId });
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = result.rows[0] || null;
    logger.debug('Task fetched from database', { taskId, found: !!task });
    return task;
  } catch (error) {
    logger.error('Error fetching task by ID', { taskId, error: error.message });
    throw error;
  }
}

async function getTaskDetailsWithAudit(taskId) {
  try {
    logger.debug('Fetching task details with audit', { taskId });
    const task = await getTaskById(taskId);
    if (!task) {
      return null;
    }

    const auditHistory = await getAuditLogsByEntity('task', taskId);
    logger.debug('Task details with audit fetched', { taskId, auditCount: auditHistory.length });
    return { task, auditHistory };
  } catch (error) {
    logger.error('Error fetching task details with audit', { taskId, error: error.message });
    throw error;
  }
}

async function getTasksByAssignee(userId, page = 1, limit = 10, searchQuery = null, sortBy = 'created_at', order = 'DESC') {
  try {
    const offset = (page - 1) * limit;
    const allowedSortFields = ['status', 'created_at', 'title', 'description'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query;
    let values;

    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      logger.debug('Fetching tasks by assignee with search', { userId, searchQuery, page, limit });
      query = `
        SELECT * FROM tasks
        WHERE assigned_to = $1 AND (title ILIKE $2 OR description ILIKE $2)
        ORDER BY ${safeSortBy} ${safeOrder}
        LIMIT $3 OFFSET $4
      `;
      values = [userId, pattern, limit, offset];
    } else {
      logger.debug('Fetching tasks by assignee', { userId, page, limit });
      query = `
        SELECT * FROM tasks
        WHERE assigned_to = $1
        ORDER BY ${safeSortBy} ${safeOrder}
        LIMIT $2 OFFSET $3
      `;
      values = [userId, limit, offset];
    }

    const result = await pool.query(query, values);
    logger.debug('Tasks fetched from database', { userId, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error fetching tasks by assignee', { userId, error: error.message });
    throw error;
  }
}

async function getTotalTasksByAssignee(userId, searchQuery = null) {
  try {
    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      logger.debug('Getting total tasks count with search', { userId, searchQuery });
      const result = await pool.query(
        'SELECT COUNT(*) as total FROM tasks WHERE assigned_to = $1 AND (title ILIKE $2 OR description ILIKE $2)',
        [userId, pattern]
      );
      return Number(result.rows[0].total);
    }

    logger.debug('Getting total tasks count', { userId });
    const result = await pool.query('SELECT COUNT(*) as total FROM tasks WHERE assigned_to = $1', [userId]);
    return Number(result.rows[0].total);
  } catch (error) {
    logger.error('Error getting total tasks count', { userId, error: error.message });
    throw error;
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    logger.debug('Updating task status in database', { taskId, status });
    await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', [status, taskId]);
    logger.debug('Task status updated', { taskId, status });
  } catch (error) {
    logger.error('Error updating task status', { taskId, status, error: error.message });
    throw error;
  }
}

async function searchTasks(searchTerm, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const pattern = `%${searchTerm}%`;
    logger.debug('Searching tasks in database', { searchTerm, page, limit });
    const query = `
      SELECT * FROM tasks
      WHERE title ILIKE $1 OR description ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [pattern, limit, offset]);
    logger.debug('Tasks search completed', { searchTerm, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error searching tasks', { searchTerm, error: error.message });
    throw error;
  }
}

async function getTotalSearchTasks(searchTerm) {
  try {
    const pattern = `%${searchTerm}%`;
    logger.debug('Getting total search tasks count', { searchTerm });
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM tasks WHERE title ILIKE $1 OR description ILIKE $1',
      [pattern]
    );
    return Number(result.rows[0].total);
  } catch (error) {
    logger.error('Error getting total search tasks count', { searchTerm, error: error.message });
    throw error;
  }
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
