const jwt = require('jsonwebtoken');
const AppError = require('../utils/app-error');

const authenticate = (req, _res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized'));
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_err) {
    return next(new AppError(403, 'Forbidden'));
  }
};

module.exports = authenticate;
