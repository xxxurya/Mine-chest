const Joi = require('joi');

const statsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().min(Joi.ref('startDate')),
  userId: Joi.string().uuid().optional(),
});

module.exports = {
  statsQuerySchema,
};
