const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

const authenticate = require('./middlewares/auth.middleware');
const {
  asyncHandler,
  requestLogger,
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const requestRoutes = require('./modules/requests/request.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const statsRoutes = require('./modules/stats/stats.routes');
const authController = require('./modules/auth/auth.controller');
const logger = require('./utils/logger');
const { swaggerSpec } = require('./config/swagger');

dotenv.config();

const app = express();

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
}));

app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Legacy auth routes (kept for compatibility)
app.post('/register', asyncHandler(authController.register));
app.post('/login', asyncHandler(authController.login));

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.role}`, user: req.user });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', authenticate, requestRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/stats', authenticate, statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', { port: PORT, host: '0.0.0.0' });
  logger.info(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  logger.info(`OpenAPI spec available at http://localhost:${PORT}/api-docs.json`);
});
