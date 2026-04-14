import axios from 'axios'
import { apiRateLimiter } from '../utils/rateLimiter'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore token errors
  }
  return config
})

// Add response interceptor for rate limit handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle rate limiting (429)
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Helper for throttled requests
const throttled = (fn) => {
  return async (...args) => {
    return apiRateLimiter.throttle(() => fn(...args));
  };
};

// ==================== SERVICES API ====================
export const getServices = throttled(async () => {
  const response = await api.get('/services')
  return response.data
})

export const getServiceByType = throttled(async (type) => {
  const response = await api.get(`/services/type/${type}`)
  return response.data
})

export const calculatePrice = throttled(async (data) => {
  const response = await api.post('/services/calculate', data)
  return response.data
})

export const createService = throttled(async (serviceData) => {
  const response = await api.post('/services', serviceData)
  return response.data
})

export const updateService = throttled(async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData)
  return response.data
})

export const deleteService = throttled(async (id) => {
  const response = await api.delete(`/services/${id}`)
  return response.data
})

// ==================== WORKING ORDERS API ====================
export const createOrder = throttled(async (orderData) => {
  const response = await api.post('/working-orders', orderData)
  return response.data
})

export const getMyOrders = throttled(async () => {
  const response = await api.get('/working-orders/my-orders')
  return response.data
})

export const getOrderById = throttled(async (id) => {
  const response = await api.get(`/working-orders/${id}`)
  return response.data
})

export const cancelOrder = throttled(async (id, reason) => {
  const response = await api.post(`/working-orders/${id}/cancel`, { reason })
  return response.data
})

export const getAllOrders = throttled(async (params = {}) => {
  const response = await api.get('/working-orders', { params })
  return response.data
})

export const getAdminOrderById = throttled(async (id) => {
  const response = await api.get(`/working-orders/admin/${id}`)
  return response.data
})

export const updateOrderStatus = throttled(async (id, data) => {
  const response = await api.put(`/working-orders/${id}/status`, data)
  return response.data
})

export const adminCancelOrder = throttled(async (id, reason) => {
  const response = await api.post(`/working-orders/admin/${id}/cancel`, { reason })
  return response.data
})

// ==================== TASKS API ====================
export const getAllTasks = throttled(async (params = {}) => {
  const response = await api.get('/tasks', { params })
  return response.data
})

export const getMyTasks = throttled(async () => {
  const response = await api.get('/tasks/my-tasks')
  return response.data
})

export const createTask = throttled(async (taskData) => {
  const response = await api.post('/tasks', taskData)
  return response.data
})

export const updateTaskStatus = throttled(async (id, data) => {
  const response = await api.put(`/tasks/${id}/status`, data)
  return response.data
})

export const uploadTaskPhotos = throttled(async (id, formData) => {
  const response = await api.post(`/tasks/${id}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
})

// ==================== CONTACT API ====================
export const submitContactForm = throttled(async (formData) => {
  const response = await api.post('/contact', formData)
  return response.data
})

// ==================== USER API ====================
export const getUserProfile = throttled(async () => {
  const response = await api.get('/users/profile')
  return response.data
})

export const updateUserProfile = throttled(async (data) => {
  const response = await api.put('/users/profile', data)
  return response.data
})

export const getAllUsers = throttled(async (params = {}) => {
  const response = await api.get('/users', { params })
  return response.data
})

// ==================== STAFF API ====================
export const createStaff = throttled(async (staffData) => {
  const response = await api.post('/users/staff', staffData)
  return response.data
})

export const getStaff = throttled(async () => {
  const response = await api.get('/users/staff')
  return response.data
})

export const updateStaff = throttled(async (id, data) => {
  const response = await api.put(`/users/${id}`, data)
  return response.data
})

export const deleteStaff = throttled(async (id) => {
  const response = await api.delete(`/services/${id}`)
  return response.data
})

// ==================== MEDIA API ====================
export const uploadVideo = throttled(async (formData, onUploadProgress) => {
  const response = await api.post('/media/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })
  return response.data
})

export const uploadImage = throttled(async (formData) => {
  const response = await api.post('/media/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
})

export const uploadMultipleImages = throttled(async (formData) => {
  const response = await api.post('/media/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
})

export const getMedia = throttled(async (params = {}) => {
  const response = await api.get('/media', { params })
  return response.data
})

export const getMediaByCategory = throttled(async (category) => {
  const response = await api.get(`/media/category/${category}`)
  return response.data
})

export const updateMedia = throttled(async (id, data) => {
  const response = await api.put(`/media/${id}`, data)
  return response.data
})

export const deleteMedia = throttled(async (id) => {
  const response = await api.delete(`/media/${id}`)
  return response.data
})

export const reorderMedia = throttled(async (category, orderedIds) => {
  const response = await api.post('/media/reorder', { category, orderedIds })
  return response.data
})

// ==================== ANALYTICS API ====================
export const getAdminStats = throttled(async () => {
  const response = await api.get('/analytics/dashboard')
  return response.data
})

export const getRevenueAnalytics = throttled(async () => {
  const response = await api.get('/analytics/revenue')
  return response.data
})

export const getOrderAnalytics = throttled(async () => {
  const response = await api.get('/analytics/orders')
  return response.data
})

// ==================== EXPORT ALL METHODS ====================
export default {
  getServices,
  getServiceByType,
  calculatePrice,
  createService,
  updateService,
  deleteService,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  adminCancelOrder,
  getAllTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  uploadTaskPhotos,
  submitContactForm,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  uploadVideo,
  uploadImage,
  uploadMultipleImages,
  getMedia,
  getMediaByCategory,
  updateMedia,
  deleteMedia,
  reorderMedia,
  getAdminStats,
  getRevenueAnalytics,
  getOrderAnalytics,
  getRateLimiterStatus: () => apiRateLimiter.getStatus()
}
