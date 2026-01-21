import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Task API
export const taskAPI = {
  getAllTasks: () => api.get('/tasks'),
  getTodayTasks: () => api.get('/tasks/today'),
  getStaticTasks: () => api.get('/tasks/static'),
  getTasksForDate: (date) => api.get(`/tasks/date/${date}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  createSubtask: (taskId, subtaskData) => api.post(`/tasks/${taskId}/subtasks`, subtaskData),
};

// Subtask API
export const subtaskAPI = {
  updateSubtask: (subtaskId, updates) => api.put(`/subtasks/${subtaskId}`, updates),
  deleteSubtask: (subtaskId) => api.delete(`/subtasks/${subtaskId}`),
  getSubtasksForTask: (taskId) => api.get(`/subtasks/task/${taskId}`),
};

// Task Instance API
export const taskInstanceAPI = {
  getInstancesForDate: (date) => api.get(`/task-instances/date/${date}`),
  toggleTaskComplete: (instanceId) => api.put(`/task-instances/${instanceId}/complete`),
  toggleSubtaskComplete: (instanceId, subtaskId) => api.put(`/task-instances/${instanceId}/subtask/${subtaskId}`),
};

export default api;