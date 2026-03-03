const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../middlewares/error.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const statsController = require('./stats.controller');
const { statsQuerySchema } = require('./stats.validation');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/stats/tasks:
 *   get:
 *     summary: Get task statistics by status
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 byStatus:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *             example:
 *               total: 50
 *               byStatus:
 *                 PENDING: 20
 *                 IN_PROGRESS: 15
 *                 COMPLETED: 15
 */
router.get(
  '/tasks',
  validate(statsQuerySchema, 'query'),
  asyncHandler(statsController.getTaskStats)
);

/**
 * @swagger
 * /api/stats/approvals:
 *   get:
 *     summary: Get approval/request statistics by status
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 byStatus:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *             example:
 *               total: 30
 *               byStatus:
 *                 PENDING: 10
 *                 APPROVED: 15
 *                 REJECTED: 5
 */
router.get(
  '/approvals',
  validate(statsQuerySchema, 'query'),
  asyncHandler(statsController.getApprovalStats)
);

module.exports = router;
