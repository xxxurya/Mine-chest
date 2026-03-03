const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { asyncHandler } = require('../../middlewares/error.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const taskController = require('./task.controller');
const {
  createTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskParamsSchema,
} = require('./task.validation');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('OWNER', 'MANAGER', 'ADMIN'),
  validate(createTaskSchema),
  asyncHandler(taskController.createTask)
);

router.get(
  '/search',
  validate(taskQuerySchema, 'query'),
  asyncHandler(taskController.searchTasks)
);

router.get(
  '/assigned',
  validate(taskQuerySchema, 'query'),
  asyncHandler(taskController.getAssignedTasks)
);

router.get(
  '/:id/details',
  validate(taskParamsSchema, 'params'),
  asyncHandler(taskController.getTaskDetails)
);

router.get(
  '/:id',
  validate(taskParamsSchema, 'params'),
  asyncHandler(taskController.getTaskById)
);

router.patch(
  '/:id/status',
  validate(taskParamsSchema, 'params'),
  validate(updateTaskStatusSchema),
  asyncHandler(taskController.updateTaskStatus)
);

module.exports = router;
