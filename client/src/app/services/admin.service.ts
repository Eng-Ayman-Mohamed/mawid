import client from './http/client';

export const adminService = {
  getDashboard() {
    return client.get('/api/admin/dashboard/').then((r) => r.data);
  },

  getUsers(params = {}) {
    return client.get('/api/admin/users/', { params }).then((r) => r.data);
  },

  approveUser(id: string) {
    return client.patch(`/api/admin/users/${id}/approve/`).then((r) => r.data);
  },

  blockUser(id: string) {
    return client.patch(`/api/admin/users/${id}/block/`).then((r) => r.data);
  },

  unblockUser(id: string) {
    return client.patch(`/api/admin/users/${id}/unblock/`).then((r) => r.data);
  },

  getAppointments(params = {}) {
    return client.get('/api/admin/appointments/', { params }).then((r) => r.data);
  },

  updateAppointmentStatus(id: string, status: string) {
    return client.patch(`/api/admin/appointments/${id}/status/`, { status }).then((r) => r.data);
  },

  getSpecialties() {
    return client.get('/api/admin/specialties/').then((r) => r.data);
  },

  createSpecialty(data: Record<string, unknown>) {
    return client.post('/api/admin/specialties/', data).then((r) => r.data);
  },

  updateSpecialty(id: string, data: Record<string, unknown>) {
    return client.patch(`/api/admin/specialties/${id}/`, data).then((r) => r.data);
  },

  deleteSpecialty(id: string) {
    return client.delete(`/api/admin/specialties/${id}/`).then((r) => r.data);
  },
};
