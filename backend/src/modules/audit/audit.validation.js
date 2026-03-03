const Joi = require('joi');

const auditQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(1000).default(100),
});

const auditParamsSchema = Joi.object({
  entityType: Joi.string().valid('task', 'request', 'user', 'approval').required()
    .messages({
      'any.only': 'Invalid entity type. Must be one of: task, request, user, approval',
      'any.required': 'entityType is required',
    }),
  entityId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'entityId must be a valid UUID',
      'any.required': 'entityId is required',
    }),
});

module.exports = {
  auditQuerySchema,
  auditParamsSchema,
};
