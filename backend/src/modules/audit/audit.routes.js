const express = require('express');
const authorize = require('../../middlewares/rbac.middleware');
const { asyncHandler } = require('../../middlewares/error.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const auditController = require('./audit.controller');
const { auditQuerySchema, auditParamsSchema } = require('./audit.validation');

const router = express.Router();

router.get(
  '/:entityType/:entityId',
  validate(auditParamsSchema, 'params'),
  asyncHandler(auditController.getAuditLogsByEntity)
);

router.get(
  '/',
  authorize('OWNER', 'ADMIN'),
  validate(auditQuerySchema, 'query'),
  asyncHandler(auditController.getAllAuditLogs)
);

module.exports = router;
