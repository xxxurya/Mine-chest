import { test, expect } from '@playwright/test';

test.describe('Task Creation and Approval', () => {
  let authToken: string;
  let workerUserId: string;
  let managerUserId: string;

  const worker = {
    username: `worker_${Date.now()}`,
    password: 'testpass123',
    role: 'WORKER',
  };

  const manager = {
    username: `manager_${Date.now()}`,
    password: 'testpass123',
    role: 'MANAGER',
  };

  test.beforeAll(async ({ request }) => {
    // Create worker user
    const workerResponse = await request.post('http://localhost:3000/register', {
      data: worker,
    });
    const workerData = await workerResponse.json();
    workerUserId = workerData.userId;

    // Create manager user
    const managerResponse = await request.post('http://localhost:3000/register', {
      data: manager,
    });
    const managerData = await managerResponse.json();
    managerUserId = managerData.userId;

    // Login as worker to get token
    const loginResponse = await request.post('http://localhost:3000/login', {
      data: {
        username: worker.username,
        password: worker.password,
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test.beforeEach(async ({ page }) => {
    // Set auth token in localStorage
    await page.addInitScript((token) => {
      window.localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should create a new task as manager', async ({ request }) => {
    // Login as manager
    const loginResponse = await request.post('http://localhost:3000/login', {
      data: {
        username: manager.username,
        password: manager.password,
      },
    });
    const loginData = await loginResponse.json();
    const managerToken = loginData.token;

    // Create task
    const createTaskResponse = await request.post('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
      data: {
        title: 'Test Task from E2E',
        description: 'This is a test task created by E2E test',
        assigned_to: workerUserId,
      },
    });

    expect(createTaskResponse.ok()).toBeTruthy();
    const taskData = await createTaskResponse.json();
    expect(taskData.id).toBeDefined();
  });

  test('should fail to create task as worker (unauthorized)', async ({ request }) => {
    const createTaskResponse = await request.post('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        title: 'Unauthorized Task',
        description: 'This should fail',
        assigned_to: workerUserId,
      },
    });

    expect(createTaskResponse.status()).toBe(403);
  });

  test('should get assigned tasks', async ({ page }) => {
    await page.goto('/mytasks');

    // Should show the tasks page
    await expect(page.locator('h1')).toContainText(/my tasks/i, { timeout: 10000 });
  });

  test('should search tasks', async ({ page }) => {
    await page.goto('/mytasks');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Search for a task
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await searchInput.press('Enter');

      // Wait for results
      await page.waitForTimeout(1000);
    }
  });

  test('should update task status as worker', async ({ request }) => {
    // First create a task as manager
    const loginResponse = await request.post('http://localhost:3000/login', {
      data: {
        username: manager.username,
        password: manager.password,
      },
    });
    const loginData = await loginResponse.json();
    const managerToken = loginData.token;

    // Create task
    const createTaskResponse = await request.post('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
      data: {
        title: 'Task for Status Update',
        description: 'Task to test status update',
        assigned_to: workerUserId,
      },
    });
    const taskData = await createTaskResponse.json();
    const taskId = taskData.id;

    // Now update status as worker
    const updateResponse = await request.patch(`http://localhost:3000/api/tasks/${taskId}/status`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    expect(updateResponse.ok()).toBeTruthy();
  });

  test('should create and approve a request', async ({ request }) => {
    // Login as manager
    const loginResponse = await request.post('http://localhost:3000/login', {
      data: {
        username: manager.username,
        password: manager.password,
      },
    });
    const loginData = await loginResponse.json();
    const managerToken = loginData.token;

    // Create a request
    const createRequestResponse = await request.post('http://localhost:3000/api/requests', {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
      data: {
        type: 'TASK',
        title: 'E2E Test Request',
        description: 'Request created by E2E test',
      },
    });

    expect(createRequestResponse.ok()).toBeTruthy();
    const requestData = await createRequestResponse.json();
    const requestId = requestData.id;

    // Approve the request
    const approveResponse = await request.patch(`http://localhost:3000/api/requests/${requestId}/approve`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
    });

    expect(approveResponse.ok()).toBeTruthy();
    const approvedData = await approveResponse.json();
    expect(approvedData.status).toBe('APPROVED');
  });

  test('should reject a request with reason', async ({ request }) => {
    // Login as manager
    const loginResponse = await request.post('http://localhost:3000/login', {
      data: {
        username: manager.username,
        password: manager.password,
      },
    });
    const loginData = await loginResponse.json();
    const managerToken = loginData.token;

    // Create a request
    const createRequestResponse = await request.post('http://localhost:3000/api/requests', {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
      data: {
        type: 'PURCHASE',
        title: 'Request to Reject',
        description: 'Request that will be rejected',
      },
    });

    const requestData = await createRequestResponse.json();
    const requestId = requestData.id;

    // Reject the request
    const rejectResponse = await request.patch(`http://localhost:3000/api/requests/${requestId}/reject`, {
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
      data: {
        reason: 'Not approved in this budget cycle',
      },
    });

    expect(rejectResponse.ok()).toBeTruthy();
    const rejectedData = await rejectResponse.json();
    expect(rejectedData.status).toBe('REJECTED');
    expect(rejectedData.rejection_reason).toBe('Not approved in this budget cycle');
  });

  test('should get task statistics', async ({ request }) => {
    const statsResponse = await request.get('http://localhost:3000/api/stats/tasks', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(statsResponse.ok()).toBeTruthy();
    const stats = await statsResponse.json();
    expect(stats.total).toBeDefined();
    expect(stats.byStatus).toBeDefined();
  });

  test('should get approval statistics', async ({ request }) => {
    const statsResponse = await request.get('http://localhost:3000/api/stats/approvals', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(statsResponse.ok()).toBeTruthy();
    const stats = await statsResponse.json();
    expect(stats.total).toBeDefined();
    expect(stats.byStatus).toBeDefined();
  });
});
