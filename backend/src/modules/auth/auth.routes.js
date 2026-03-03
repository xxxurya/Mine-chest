const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../middlewares/error.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const authController = require('./auth.controller');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
