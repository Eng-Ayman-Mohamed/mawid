import client from './http/client';
import { normalizeDoctor, type NormalizedDoctor, type RawDoctor } from '../utils/normalizers/doctor';
import { normalizeAppointment } from '../utils/normalizers/appointment';

function getResults<T>(data: T): T extends { results: infer R } ? R : T[] {
  return (Array.isArray(data) ? data : (data as any)?.results || []) as any;
}

export const doctorService = {
  getProfile() {
    return client.get<RawDoctor>('/api/doctors/profile/').then((r) => normalizeDoctor(r.data));
  },

  updateProfile(data: Record<string, unknown>) {
    return client.patch('/api/doctors/profile/', data).then((r) => r.data);
  },

  getAppointments() {
    return Promise.all([
      client.get('/api/doctors/appointments/'),
      client.get('/api/doctors/').then((r) => getResults(r.data).map(normalizeDoctor)),
    ]).then(([appointmentsRes, doctors]) =>
      getResults(appointmentsRes.data).map((a: any) => normalizeAppointment(a, doctors)),
    );
  },

  updateAppointmentStatus(id: string, data: Record<string, unknown>) {
    return client.patch(`/api/appointments/${id}/status/`, data).then((r) => r.data);
  },
};
