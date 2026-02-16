import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const boardAPI = {
  getBoards: () => api.get('/boards'),
  getBoard: (id) => api.get(`/boards/${id}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  addMember: (id, email) => api.post(`/boards/${id}/members`, { email }),
};

export const listAPI = {
  createList: (boardId, data) => api.post(`/boards/${boardId}/lists`, data),
  updateList: (id, data) => api.put(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
};

export const taskAPI = {
  createTask: (listId, data) => api.post(`/lists/${listId}/tasks`, data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  moveTask: (id, data) => api.put(`/tasks/${id}/move`, data),
  assignTask: (id, userId) => api.post(`/tasks/${id}/assign`, { userId }),
};

export default api;
