const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least {#limit} characters',
      'string.max': 'Username must not exceed {#limit} characters',
      'any.required': 'Username is required',
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password must not exceed {#limit} characters',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('OWNER', 'MANAGER', 'WORKER', 'CLIENT', 'ADMIN').required()
    .messages({
      'any.only': 'Invalid role. Must be one of: OWNER, MANAGER, WORKER, CLIENT, ADMIN',
      'any.required': 'Role is required',
    }),
});

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least {#limit} characters',
      'string.max': 'Username must not exceed {#limit} characters',
      'any.required': 'Username is required',
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password must not exceed {#limit} characters',
      'any.required': 'Password is required',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
