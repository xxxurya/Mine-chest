const BASE_URL = "http://localhost:3000";

// ==================== Auth Helpers ====================

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getUserRole = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.role || null;
};

// ==================== Core Fetch Function ====================

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// ==================== Auth Service ====================

export const authService = {
  login: async (username, password) => {
    const data = await fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    return data;
  },

  register: async (username, password, role) => {
    return fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    });
  },

  logout: () => {
    localStorage.removeItem("authToken");
  },

  getCurrentUser: async () => {
    return fetchWithAuth("/api/auth/me");
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ==================== Tasks Service ====================

export const tasksService = {
  // Get all tasks
  getTasks: async () => {
    return fetchWithAuth("/api/tasks");
  },

  // Get tasks with filters and pagination
  filterTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/tasks?${queryString}` : "/api/tasks";
    
    return fetchWithAuth(endpoint);
  },

  // Get task by ID
  getTaskById: async (id) => {
    return fetchWithAuth(`/api/tasks/${id}`);
  },

  // Get tasks assigned to current user
  getAssignedTasks: async () => {
    return fetchWithAuth("/api/tasks/assigned");
  },

  // Create new task
  createTask: async (taskData) => {
    return fetchWithAuth("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  // Update task
  updateTask: async (id, taskData) => {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },

  // Delete task
  deleteTask: async (id) => {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== Users Service ====================

export const usersService = {
  getUsers: async () => {
    return fetchWithAuth("/api/users");
  },

  getUserById: async (id) => {
    return fetchWithAuth(`/api/users/${id}`);
  },

  createUser: async (userData) => {
    return fetchWithAuth("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return fetchWithAuth(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return fetchWithAuth(`/api/users/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== Approvals Service ====================

export const approvalsService = {
  // Get pending requests/approvals
  getPendingApprovals: async () => {
    return fetchWithAuth("/api/requests?status=PENDING");
  },

  // Get all approvals
  getApprovals: async () => {
    return fetchWithAuth("/api/approvals");
  },

  // Get approval by ID
  getApprovalById: async (id) => {
    return fetchWithAuth(`/api/approvals/${id}`);
  },

  // Create approval
  createApproval: async (approvalData) => {
    return fetchWithAuth("/api/approvals", {
      method: "POST",
      body: JSON.stringify(approvalData),
    });
  },

  // Update approval
  updateApproval: async (id, approvalData) => {
    return fetchWithAuth(`/api/approvals/${id}`, {
      method: "PUT",
      body: JSON.stringify(approvalData),
    });
  },

  // Approve request
  approveRequest: async (id) => {
    return fetchWithAuth(`/api/requests/${id}/approve`, {
      method: "PATCH",
    });
  },

  // Reject request with reason
  rejectRequest: async (id, reason) => {
    return fetchWithAuth(`/api/requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  // Legacy approve (for compatibility)
  approveLegacy: async (id) => {
    return fetchWithAuth(`/api/approvals/${id}/approve`, {
      method: "POST",
    });
  },

  // Legacy reject (for compatibility)
  rejectLegacy: async (id) => {
    return fetchWithAuth(`/api/approvals/${id}/reject`, {
      method: "POST",
    });
  },
};

// ==================== Audit Service ====================

export const auditService = {
  getHistory: async (entityType, entityId) => {
    return fetchWithAuth(`/api/audit/${entityType}/${entityId}`);
  },

  // Alternative endpoint format
  getTaskHistory: async (taskId) => {
    return fetchWithAuth(`/api/audit/tasks/${taskId}`);
  },
};

// ==================== Default Exports (for backward compatibility) ====================

// Auth exports
export const loginUser = authService.login;
export const registerUser = authService.register;
export const logoutUser = authService.logout;
export const getCurrentUser = authService.getCurrentUser;
export const checkAuth = authService.isAuthenticated;

// Tasks exports
export const fetchTasks = tasksService.getTasks;
export const getTasks = tasksService.getTasks;
export const filterTasks = tasksService.filterTasks;
export const fetchTaskById = tasksService.getTaskById;
export const fetchAssignedTasks = tasksService.getAssignedTasks;
export const createTask = tasksService.createTask;
export const updateTask = tasksService.updateTask;
export const deleteTask = tasksService.deleteTask;

// Users exports
export const fetchUsers = usersService.getUsers;
export const fetchUserById = usersService.getUserById;
export const createUser = usersService.createUser;
export const updateUser = usersService.updateUser;
export const deleteUser = usersService.deleteUser;

// Approvals exports
export const fetchPendingRequests = approvalsService.getPendingApprovals;
export const fetchApprovals = approvalsService.getApprovals;
export const fetchApprovalById = approvalsService.getApprovalById;
export const createApproval = approvalsService.createApproval;
export const updateApproval = approvalsService.updateApproval;
export const approveRequest = approvalsService.approveRequest;
export const rejectRequestWithReason = approvalsService.rejectRequest;
export const approveRequestLegacy = approvalsService.approveLegacy;
export const rejectRequest = approvalsService.rejectLegacy;

// Audit exports
export const fetchAuditHistory = auditService.getHistory;

// Storage helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Default export for backward compatibility
export default {
  // Auth
  authService,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  checkAuth,
  setAuthToken,
  removeAuthToken,
  getUserRole,

  // Tasks
  tasksService,
  fetchTasks,
  getTasks,
  filterTasks,
  fetchTaskById,
  fetchAssignedTasks,
  createTask,
  updateTask,
  deleteTask,

  // Users
  usersService,
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,

  // Approvals
  approvalsService,
  fetchPendingRequests,
  fetchApprovals,
  fetchApprovalById,
  createApproval,
  updateApproval,
  approveRequest,
  rejectRequestWithReason,
  approveRequestLegacy,
  rejectRequest,

  // Audit
  auditService,
  fetchAuditHistory,
};
