const request = require('supertest');
const express = require('express');

// Test data setup
const testData = {
  users: {
    owner: { id: 'user-owner-uuid', username: 'owner1', role: 'OWNER' },
    manager: { id: 'user-manager-uuid', username: 'manager1', role: 'MANAGER' },
    admin: { id: 'user-admin-uuid', username: 'admin1', role: 'ADMIN' }
  },
  requests: [
    { 
      id: 'request-uuid-1', 
      type: 'TASK', 
      title: 'Request 1', 
      description: 'Description 1', 
      status: 'PENDING', 
      requested_by: 'user-manager-uuid' 
    },
    { 
      id: 'request-uuid-2', 
      type: 'PURCHASE', 
      title: 'Request 2', 
      description: 'Description 2', 
      status: 'APPROVED', 
      requested_by: 'user-manager-uuid',
      approved_by: 'user-owner-uuid'
    },
    { 
      id: 'request-uuid-3', 
      type: 'LEAVE', 
      title: 'Request 3', 
      description: 'Description 3', 
      status: 'REJECTED', 
      requested_by: 'user-manager-uuid',
      rejected_by: 'user-owner-uuid',
      rejection_reason: 'Not approved'
    }
  ]
};

// Mock the dependencies
jest.mock('../src/modules/requests/request.service', () => ({
  createRequest: jest.fn(),
  getRequests: jest.fn(),
  getRequestById: jest.fn(),
  approveRequest: jest.fn(),
  rejectRequest: jest.fn()
}));

jest.mock('../src/middlewares/auth.middleware', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => {
    req.user = { id: testData.users.owner.id, role: 'OWNER' };
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

const requestService = require('../src/modules/requests/request.service');
const requestRoutes = require('../src/modules/requests/request.routes');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: testData.users.owner.id, role: 'OWNER' };
  next();
});

app.use('/api/requests', requestRoutes);

describe('Request Routes (Approvals)', () => {
  beforeAll(() => {
    // Global test setup
    global.testData = testData;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service mocks to return test data
    requestService.createRequest.mockResolvedValue(testData.requests[0]);
    requestService.getRequests.mockResolvedValue(testData.requests);
    requestService.getRequestById.mockResolvedValue(testData.requests[0]);
    requestService.approveRequest.mockResolvedValue({ ...testData.requests[1], status: 'APPROVED' });
    requestService.rejectRequest.mockResolvedValue({ ...testData.requests[2], status: 'REJECTED' });
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Global test cleanup
    delete global.testData;
  });

  describe('POST /api/requests', () => {
    it('should create a new TASK request successfully', async () => {
      const newRequest = {
        type: 'TASK',
        title: 'New Task Request',
        description: 'New Task Description'
      };

      const response = await request(app)
        .post('/api/requests')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'TASK');
    });

    it('should create a new PURCHASE request successfully', async () => {
      const newRequest = {
        type: 'PURCHASE',
        title: 'New Purchase Request',
        description: 'New Purchase Description',
        metadata: { amount: 1000 }
      };

      const response = await request(app)
        .post('/api/requests')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should create request without description', async () => {
      const newRequest = {
        type: 'LEAVE',
        title: 'Leave Request'
      };

      const response = await request(app)
        .post('/api/requests')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 if type is missing', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({
          title: 'Test Request'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({
          type: 'TASK'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 if database error', async () => {
      requestService.createRequest.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/requests')
        .send({
          type: 'TASK',
          title: 'Test Request'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/requests', () => {
    it('should get all requests', async () => {
      const response = await request(app)
        .get('/api/requests');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter requests by PENDING status', async () => {
      const pendingRequests = [testData.requests[0]];
      requestService.getRequests.mockResolvedValue(pendingRequests);

      const response = await request(app)
        .get('/api/requests')
        .query({ status: 'PENDING' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(pendingRequests);
      expect(requestService.getRequests).toHaveBeenCalledWith('PENDING');
    });

    it('should filter requests by APPROVED status', async () => {
      const approvedRequests = [testData.requests[1]];
      requestService.getRequests.mockResolvedValue(approvedRequests);

      const response = await request(app)
        .get('/api/requests')
        .query({ status: 'APPROVED' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(approvedRequests);
    });

    it('should filter requests by REJECTED status', async () => {
      const rejectedRequests = [testData.requests[2]];
      requestService.getRequests.mockResolvedValue(rejectedRequests);

      const response = await request(app)
        .get('/api/requests')
        .query({ status: 'REJECTED' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(rejectedRequests);
    });

    it('should return empty array if no requests found', async () => {
      requestService.getRequests.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/requests')
        .query({ status: 'NONEXISTENT' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 if database error', async () => {
      requestService.getRequests.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/requests');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/requests/:id/approve', () => {
    it('should approve a PENDING request successfully', async () => {
      const pendingRequest = { ...testData.requests[0], status: 'PENDING' };
      requestService.getRequestById.mockResolvedValue(pendingRequest);
      requestService.approveRequest.mockResolvedValue({ ...pendingRequest, status: 'APPROVED' });

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[0].id}/approve`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'APPROVED');
    });

    it('should return 404 if request not found', async () => {
      requestService.getRequestById.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/requests/nonexistent-id/approve');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Request not found');
    });

    it('should return 400 if request already APPROVED', async () => {
      const approvedRequest = { ...testData.requests[1], status: 'APPROVED' };
      requestService.getRequestById.mockResolvedValue(approvedRequest);

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[1].id}/approve`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Request has already been processed');
    });

    it('should return 400 if request already REJECTED', async () => {
      const rejectedRequest = { ...testData.requests[2], status: 'REJECTED' };
      requestService.getRequestById.mockResolvedValue(rejectedRequest);

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[2].id}/approve`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Request has already been processed');
    });

    it('should return 500 if database error', async () => {
      const pendingRequest = { ...testData.requests[0], status: 'PENDING' };
      requestService.getRequestById.mockResolvedValue(pendingRequest);
      requestService.approveRequest.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[0].id}/approve`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/requests/:id/reject', () => {
    it('should reject a PENDING request with reason', async () => {
      const pendingRequest = { ...testData.requests[0], status: 'PENDING' };
      requestService.getRequestById.mockResolvedValue(pendingRequest);
      requestService.rejectRequest.mockResolvedValue({ ...pendingRequest, status: 'REJECTED', rejection_reason: 'Not approved' });

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[0].id}/reject`)
        .send({ reason: 'Not approved' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'REJECTED');
    });

    it('should return 400 if rejection reason is missing', async () => {
      const response = await request(app)
        .patch(`/api/requests/${testData.requests[0].id}/reject`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Rejection reason is required');
    });

    it('should return 404 if request not found', async () => {
      requestService.getRequestById.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/requests/nonexistent-id/reject')
        .send({ reason: 'Not approved' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Request not found');
    });

    it('should return 400 if request already APPROVED', async () => {
      const approvedRequest = { ...testData.requests[1], status: 'APPROVED' };
      requestService.getRequestById.mockResolvedValue(approvedRequest);

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[1].id}/reject`)
        .send({ reason: 'Not approved' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Request has already been processed');
    });

    it('should return 400 if request already REJECTED', async () => {
      const rejectedRequest = { ...testData.requests[2], status: 'REJECTED' };
      requestService.getRequestById.mockResolvedValue(rejectedRequest);

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[2].id}/reject`)
        .send({ reason: 'Not approved' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Request has already been processed');
    });

    it('should return 500 if database error', async () => {
      const pendingRequest = { ...testData.requests[0], status: 'PENDING' };
      requestService.getRequestById.mockResolvedValue(pendingRequest);
      requestService.rejectRequest.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch(`/api/requests/${testData.requests[0].id}/reject`)
        .send({ reason: 'Not approved' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
