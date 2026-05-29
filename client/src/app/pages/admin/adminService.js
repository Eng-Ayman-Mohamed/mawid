import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const adminApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

adminApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.detail || error.response?.data?.error || 'Admin API request failed';
        return Promise.reject(new Error(message));
    }
);

export const adminService = {
    login(email, password) {
        return axios.post(`${API_BASE_URL}/api/auth/login/`, { email, password });
    },

    getDashboard() {
        return adminApi.get('/api/admin/dashboard/');
    },

    getUsers(params = {}) {
        return adminApi.get('/api/admin/users/', { params });
    },

    approveUser(id) {
        return adminApi.patch(`/api/admin/users/${id}/approve/`);
    },

    blockUser(id) {
        return adminApi.patch(`/api/admin/users/${id}/block/`);
    },

    unblockUser(id) {
        return adminApi.patch(`/api/admin/users/${id}/unblock/`);
    },

    getAppointments(params = {}) {
        return adminApi.get('/api/admin/appointments/', { params });
    },

    updateAppointmentStatus(id, appointmentStatus) {
        return adminApi.patch(`/api/admin/appointments/${id}/status/`, { status: appointmentStatus });
    },

    getSpecialties() {
        return adminApi.get('/api/admin/specialties/');
    },

    createSpecialty(data) {
        return adminApi.post('/api/admin/specialties/', data);
    },

    updateSpecialty(id, data) {
        return adminApi.patch(`/api/admin/specialties/${id}/`, data);
    },

    deleteSpecialty(id) {
        return adminApi.delete(`/api/admin/specialties/${id}/`);
    },
};