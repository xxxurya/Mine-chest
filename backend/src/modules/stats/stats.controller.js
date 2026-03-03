const statsService = require('./stats.service');
const logger = require('../../utils/logger');

/**
 * Get task statistics - counts by status
 * GET /api/stats/tasks
 */
async function getTaskStats(req, res, next) {
  try {
    const { startDate, endDate, userId } = req.query;
    logger.info('Fetching task statistics', { startDate, endDate, userId });
    const stats = await statsService.getTaskStats({ startDate, endDate, userId });
    logger.info('Task statistics fetched successfully', { total: stats.total });
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * Get approval/request statistics - counts by status
 * GET /api/stats/approvals
 */
async function getApprovalStats(req, res, next) {
  try {
    const { startDate, endDate, userId } = req.query;
    logger.info('Fetching approval statistics', { startDate, endDate, userId });
    const stats = await statsService.getApprovalStats({ startDate, endDate, userId });
    logger.info('Approval statistics fetched successfully', { total: stats.total });
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTaskStats,
  getApprovalStats,
};
