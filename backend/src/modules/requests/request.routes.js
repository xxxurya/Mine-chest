const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const { asyncHandler } = require('../../middlewares/error.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const requestController = require('./request.controller');
const {
  createRequestSchema,
  requestQuerySchema,
  requestParamsSchema,
  rejectRequestSchema,
} = require('./request.validation');

const router = express.Router();

router.post(
  '/',
  authorize('MANAGER', 'OWNER', 'ADMIN'),
  validate(createRequestSchema),
  asyncHandler(requestController.createRequest)
);

router.get(
  '/',
  validate(requestQuerySchema, 'query'),
  asyncHandler(requestController.getRequests)
);

router.patch(
  '/:id/approve',
  authorize('OWNER', 'ADMIN'),
  validate(requestParamsSchema, 'params'),
  asyncHandler(requestController.approveRequest)
);

router.patch(
  '/:id/reject',
  authorize('OWNER', 'ADMIN'),
  validate(requestParamsSchema, 'params'),
  validate(rejectRequestSchema),
  asyncHandler(requestController.rejectRequest)
);

module.exports = router;
