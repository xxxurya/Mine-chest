const AppError = require('../../utils/app-error');
const auditService = require('./audit.service');
const logger = require('../../utils/logger');

/**
 * Entity types for audit logs
 * @typedef {string} EntityType
 * @enum {EntityType}
 */
const validEntityTypes = ['task', 'request', 'user', 'approval'];

/**
 * Retrieves audit logs for a specific entity.
 * Requires authentication.
 * 
 * @async
 * @function getAuditLogsByEntity
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.entityType - Type of entity (task, request, user, approval)
 * @param {string} req.params.entityId - Unique identifier of the entity (UUID)
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - Authenticated user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @example
 * // Request example:
 * GET /api/audit/task/660e8400-e29b-41d4-a716-446655440000
 * 
 * // Success response (200):
 * [
 *   {
 *     "id": "770e8400-e29b-41d4-a716-446655440000",
 *     "entity_type": "task",
 *     "entity_id": "660e8400-e29b-41d4-a716-446655440000",
 *     "action": "CREATED",
 *     "user_id": "550e8400-e29b-41d4-a716-446655440001",
 *     "user_username": "john_doe",
 *     "details": { "title": "Complete documentation" },
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   },
 *   {
 *     "id": "770e8400-e29b-41d4-a716-446655440001",
 *     "entity_type": "task",
 *     "entity_id": "660e8400-e29b-41d4-a716-446655440000",
 *     "action": "STATUS_CHANGED",
 *     "user_id": "550e8400-e29b-41d4-a716-446655440002",
 *     "user_username": "jane_smith",
 *     "details": { "old_status": "PENDING", "new_status": "IN_PROGRESS" },
 *     "timestamp": "2024-01-02T00:00:00.000Z"
 *   }
 * ]
 * 
 * // Error responses:
 * // 400 - Missing parameters: { "error": "Missing required parameters: entityType and entityId" }
 * // 500 - Server error: { "error": "Error message" }
 */
async function getAuditLogsByEntity(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    if (!entityType || !entityId) {
      logger.warn('Get audit logs failed: Missing required parameters');
      throw new AppError(400, 'Missing required parameters: entityType and entityId');
    }

    logger.info('Fetching audit logs by entity', { entityType, entityId, userId: req.user.id });
    const auditLogs = await auditService.getAuditLogsByEntity(entityType, entityId);
    logger.info('Audit logs fetched successfully', { entityType, entityId, count: auditLogs.length });
    res.json(auditLogs);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves all audit logs in the system.
 * Requires authentication and authorization (OWNER, ADMIN roles only).
 * 
 * @async
 * @function getAllAuditLogs
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.limit=100] - Maximum number of logs to return
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - Authenticated user's ID
 * @param {string} req.user.role - Authenticated user's role
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @example
 * // Request example:
 * GET /api/audit?limit=50
 * 
 * // Success response (200):
 * [
 *   {
 *     "id": "770e8400-e29b-41d4-a716-446655440000",
 *     "entity_type": "task",
 *     "entity_id": "660e8400-e29b-41d4-a716-446655440000",
 *     "action": "CREATED",
 *     "user_id": "550e8400-e29b-41d4-a716-446655440001",
 *     "user_username": "john_doe",
 *     "details": { "title": "Complete documentation" },
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   },
 *   {
 *     "id": "770e8400-e29b-41d4-a716-446655440001",
 *     "entity_type": "request",
 *     "entity_id": "660e8400-e29b-41d4-a716-446655440002",
 *     "action": "APPROVED",
 *     "user_id": "550e8400-e29b-41d4-a716-446655440003",
 *     "user_username": "admin_user",
 *     "details": { "type": "PURCHASE" },
 *     "timestamp": "2024-01-02T00:00:00.000Z"
 *   }
 * ]
 * 
 * // Error responses:
 * // 403 - Forbidden (non-admin): { "error": "Forbidden" }
 * // 500 - Server error: { "error": "Error message" }
 */
async function getAllAuditLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    logger.info('Fetching all audit logs', { limit, userId: req.user.id });
    const auditLogs = await auditService.getAllAuditLogs(limit);
    logger.info('All audit logs fetched successfully', { count: auditLogs.length, limit });
    res.json(auditLogs);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogsByEntity,
  getAllAuditLogs,
};
