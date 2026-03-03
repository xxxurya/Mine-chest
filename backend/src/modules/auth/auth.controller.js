const AppError = require('../../utils/app-error');
const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { username, password, role } = req.body;

    const result = await authService.registerUser(username, password, role);
    res.status(201).json({ message: 'User created successfully', userId: result.userId });
  } catch (error) {
    if (error.code === '23505') {
      return next(new AppError(400, 'Username already exists'));
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const result = await authService.loginUser(username, password);
    if (!result) {
      return next(new AppError(401, 'Invalid credentials'));
    }

    res.json({ token: result.token, user: result.user });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    res.json(user);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};
