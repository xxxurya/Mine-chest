const Joi = require('joi');

const createRequestSchema = Joi.object({
  type: Joi.string().valid('PURCHASE', 'TASK', 'LEAVE', 'OTHER').required()
    .messages({
      'any.only': 'Invalid request type. Must be one of: PURCHASE, TASK, LEAVE, OTHER',
      'any.required': 'Type is required',
    }),
  title: Joi.string().min(1).max(200).required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed {#limit} characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string().max(1000).allow('')
    .messages({
      'string.max': 'Description must not exceed {#limit} characters',
    }),
  metadata: Joi.object().optional(),
});

const requestQuerySchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const requestParamsSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Request ID must be a valid UUID',
      'any.required': 'Request ID is required',
    }),
});

const rejectRequestSchema = Joi.object({
  reason: Joi.string().min(1).max(500).required()
    .messages({
      'string.min': 'Rejection reason cannot be empty',
      'string.max': 'Rejection reason must not exceed {#limit} characters',
      'any.required': 'Rejection reason is required',
    }),
});

module.exports = {
  createRequestSchema,
  requestQuerySchema,
  requestParamsSchema,
  rejectRequestSchema,
};
