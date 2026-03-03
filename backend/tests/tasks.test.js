const request = require('supertest');
const express = require('express');

// Test data setup
const testData = {
  users: {
    manager: { id: 'user-manager-uuid', username: 'manager1', role: 'MANAGER' },
    worker: { id: 'user-worker-uuid', username: 'worker1', role: 'WORKER' },
    admin: { id: 'user-admin-uuid', username: 'admin1', role: 'ADMIN' }
  },
  tasks: [
    { id: 'task-uuid-1', title: 'Task 1', description: 'Description 1', status: 'PENDING', assigned_to: 'user-worker-uuid' },
    { id: 'task-uuid-2', title: 'Task 2', description: 'Description 2', status: 'IN_PROGRESS', assigned_to: 'user-worker-uuid' },
    { id: 'task-uuid-3', title: 'Task 3', description: 'Description 3', status: 'COMPLETED', assigned_to: 'user-worker-uuid' }
  ]
};

// Mock the dependencies
jest.mock('../src/modules/tasks/task.service', () => ({
  createTask: jest.fn(),
  getTaskById: jest.fn(),
  getTaskDetailsWithAudit: jest.fn(),
  getTasksByAssignee: jest.fn(),
  getTotalTasksByAssignee: jest.fn(),
  updateTaskStatus: jest.fn(),
  searchTasks: jest.fn(),
  getTotalSearchTasks: jest.fn()
}));

jest.mock('../src/middlewares/auth.middleware', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => {
    req.user = { id: testData.users.manager.id, role: 'MANAGER' };
    next();
  })
}));

jest.mock('../src/middlewares/rbac.middleware', () => ({
  __esModule: true,
  default: (...roles) => jest.fn((req, res, next) => next())
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const taskService = require('../src/modules/tasks/task.service');
const taskRoutes = require('../src/modules/tasks/task.routes');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  beforeAll(() => {
    // Global test setup
    global.testData = testData;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service mocks to return test data
    taskService.createTask.mockResolvedValue(testData.tasks[0].id);
    taskService.getTaskById.mockResolvedValue(testData.tasks[0]);
    taskService.getTasksByAssignee.mockResolvedValue(testData.tasks);
    taskService.getTotalTasksByAssignee.mockResolvedValue(testData.tasks.length);
    taskService.updateTaskStatus.mockResolvedValue();
    taskService.searchTasks.mockResolvedValue(testData.tasks);
    taskService.getTotalSearchTasks.mockResolvedValue(testData.tasks.length);
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Global test cleanup
    delete global.testData;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Task Description',
        assigned_to: testData.users.worker.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', testData.tasks[0].id);
    });

    it('should create task without description', async () => {
      const newTask = {
        title: 'New Task',
        assigned_to: testData.users.worker.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          assigned_to: testData.users.worker.id
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if assigned_to is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 if database error', async () => {
      taskService.createTask.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task',
          assigned_to: testData.users.worker.id
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/search', () => {
    it('should search tasks with query parameter', async () => {
      const response = await request(app)
        .get('/api/tasks/search')
        .query({ q: 'task' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it('should return 400 if search query is missing', async () => {
      const response = await request(app)
        .get('/api/tasks/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Search query parameter "q" is required');
    });

    it('should return empty array if no tasks found', async () => {
      taskService.searchTasks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/tasks/search')
        .query({ q: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.tasks).toEqual([]);
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/tasks/search')
        .query({ q: 'task', page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should return 500 if database error', async () => {
      taskService.searchTasks.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks/search')
        .query({ q: 'task' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/assigned', () => {
    it('should get tasks assigned to user', async () => {
      const response = await request(app)
        .get('/api/tasks/assigned');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it('should return paginated assigned tasks', async () => {
      const response = await request(app)
        .get('/api/tasks/assigned')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/tasks/assigned')
        .query({ sortBy: 'status', order: 'ASC' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sort');
    });

    it('should return 500 if database error', async () => {
      taskService.getTasksByAssignee.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks/assigned');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testData.tasks[0].id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testData.tasks[0].id);
      expect(response.body).toHaveProperty('title', testData.tasks[0].title);
    });

    it('should return 404 if task not found', async () => {
      taskService.getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 500 if database error', async () => {
      taskService.getTaskById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/tasks/${testData.tasks[0].id}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id/details', () => {
    it('should get task details with audit history', async () => {
      const taskWithAudit = {
        task: testData.tasks[0],
        auditHistory: []
      };
      taskService.getTaskDetailsWithAudit.mockResolvedValue(taskWithAudit);

      const response = await request(app)
        .get(`/api/tasks/${testData.tasks[0].id}/details`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('task');
      expect(response.body).toHaveProperty('auditHistory');
    });

    it('should return 404 if task not found', async () => {
      taskService.getTaskDetailsWithAudit.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/nonexistent-id/details');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status successfully', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testData.tasks[0].id}/status`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Status updated');
    });

    it('should return 400 if status is missing', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testData.tasks[0].id}/status`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if task not found', async () => {
      taskService.getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/tasks/nonexistent-id/status')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 500 if database error', async () => {
      taskService.updateTaskStatus.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch(`/api/tasks/${testData.tasks[0].id}/status`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
