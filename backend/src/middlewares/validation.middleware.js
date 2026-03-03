const AppError = require('../utils/app-error');

/**
 * Middleware to validate request body, params, or query using Joi schemas
 * @param {Object} schema - Joi schema object
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(new AppError(400, 'Validation error', details));
    }

    req[property] = value;
    next();
  };
};

module.exports = { validate };
