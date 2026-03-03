const BASE_URL = "http://localhost:3000";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to decode JWT token and get payload
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

// Helper function to get user role from JWT token
export const getUserRole = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.role || null;
};

// Helper function for making authenticated requests
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

// ==================== Auth API ====================

export const loginUser = async (username, password) => {
  const data = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // Save token to localStorage on successful login
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }

  return data;
};

export const registerUser = async (username, password, role) => {
  return fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
};

export const logoutUser = () => {
  localStorage.removeItem("authToken");
};

export const getCurrentUser = async () => {
  return fetchWithAuth("/api/auth/me");
};

// ==================== Tasks API ====================

export const getTasks = async () => {
  return fetchWithAuth("/api/tasks");
};

export const fetchTasks = async () => {
  return fetchWithAuth("/api/tasks");
};

export const fetchAssignedTasks = async () => {
  return fetchWithAuth("/api/tasks/assigned");
};

export const fetchTaskById = async (id) => {
  return fetchWithAuth(`/api/tasks/${id}`);
};

export const createTask = async (taskData) => {
  return fetchWithAuth("/api/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
};

export const updateTask = async (id, taskData) => {
  return fetchWithAuth(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
};

export const deleteTask = async (id) => {
  return fetchWithAuth(`/api/tasks/${id}`, {
    method: "DELETE",
  });
};

// ==================== Users API ====================

export const fetchUsers = async () => {
  return fetchWithAuth("/api/users");
};

export const fetchUserById = async (id) => {
  return fetchWithAuth(`/api/users/${id}`);
};

export const createUser = async (userData) => {
  return fetchWithAuth("/api/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id, userData) => {
  return fetchWithAuth(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id) => {
  return fetchWithAuth(`/api/users/${id}`, {
    method: "DELETE",
  });
};

// ==================== Approvals/Requests API ====================

export const getPendingRequests = async () => {
  return fetchWithAuth("/api/requests?status=PENDING");
};

export const fetchPendingRequests = async () => {
  return fetchWithAuth("/api/requests?status=PENDING");
};

export const fetchApprovals = async () => {
  return fetchWithAuth("/api/approvals");
};

export const fetchApprovalById = async (id) => {
  return fetchWithAuth(`/api/approvals/${id}`);
};

export const createApproval = async (approvalData) => {
  return fetchWithAuth("/api/approvals", {
    method: "POST",
    body: JSON.stringify(approvalData),
  });
};

export const updateApproval = async (id, approvalData) => {
  return fetchWithAuth(`/api/approvals/${id}`, {
    method: "PUT",
    body: JSON.stringify(approvalData),
  });
};

export const approveRequest = async (id) => {
  return fetchWithAuth(`/api/requests/${id}/approve`, {
    method: "PATCH",
  });
};

export const rejectRequestWithReason = async (id, reason) => {
  return fetchWithAuth(`/api/requests/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
};

// Approve and reject task functions (consistent naming)
export const approveTask = async (id) => {
  return fetchWithAuth(`/api/requests/${id}/approve`, {
    method: "PATCH",
  });
};

export const rejectTask = async (id, reason) => {
  return fetchWithAuth(`/api/requests/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
};

// Legacy functions (kept for compatibility)
export const approveRequestLegacy = async (id) => {
  return fetchWithAuth(`/api/approvals/${id}/approve`, {
    method: "POST",
  });
};

export const rejectRequest = async (id) => {
  return fetchWithAuth(`/api/approvals/${id}/reject`, {
    method: "POST",
  });
};

// ==================== Audit History API ====================

export const getHistory = async (entityType, entityId) => {
  return fetchWithAuth(`/api/audit/${entityType}/${entityId}`);
};

export const getTaskHistory = async (taskId) => {
  return fetchWithAuth(`/api/audit/tasks/${taskId}`);
};

export const fetchAuditHistory = async (entityType, entityId) => {
  return fetchWithAuth(`/api/audit/${entityType}/${entityId}`);
};

// ==================== Generic API Helpers ====================

export const checkAuth = () => {
  const token = getAuthToken();
  return !!token;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

export default {
  // Auth
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  
  // Tasks
  getTasks,
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  
  // Users
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Approvals/Requests
  getPendingRequests,
  fetchPendingRequests,
  fetchApprovals,
  fetchApprovalById,
  createApproval,
  updateApproval,
  approveRequest,
  approveTask,
  rejectRequestWithReason,
  rejectTask,
  
  // Audit History
  getHistory,
  getTaskHistory,
  fetchAuditHistory,
  
  // Helpers
  checkAuth,
  setAuthToken,
  removeAuthToken,
  getUserRole,
};
