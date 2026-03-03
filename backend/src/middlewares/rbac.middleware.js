const AppError = require('../utils/app-error');

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden: Insufficient permissions'));
    }

    return next();
  };
};

module.exports = authorize;
