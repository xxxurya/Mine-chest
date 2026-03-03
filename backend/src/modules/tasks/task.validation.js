const Joi = require('joi');

const createTaskSchema = Joi.object({
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
  assigned_to: Joi.string().uuid().required()
    .messages({
      'string.guid': 'assigned_to must be a valid UUID',
      'any.required': 'assigned_to is required',
    }),
});

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required()
    .messages({
      'any.only': 'Invalid status. Must be one of: PENDING, IN_PROGRESS, COMPLETED, CANCELLED',
      'any.required': 'Status is required',
    }),
});

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().max(100).allow(''),
  sortBy: Joi.string().valid('status', 'created_at', 'title', 'description').default('created_at'),
  order: Joi.string().valid('ASC', 'DESC').uppercase().default('DESC'),
});

const taskParamsSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Task ID must be a valid UUID',
      'any.required': 'Task ID is required',
    }),
});

module.exports = {
  createTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskParamsSchema,
};
