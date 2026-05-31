import client from './http/client';
import { normalizeDoctor, type NormalizedDoctor, type RawDoctor } from '../utils/normalizers/doctor';
import { normalizeAppointment, type NormalizedAppointment } from '../utils/normalizers/appointment';

function getResults<T>(data: T): T extends { results: infer R } ? R : T[] {
  return (Array.isArray(data) ? data : (data as any)?.results || []) as any;
}

export const patientService = {
  getDoctors(params = {}) {
    return client
      .get<RawDoctor[]>('/api/doctors/', { params })
      .then((r) => getResults(r.data).map(normalizeDoctor));
  },

  getDoctor(id: string) {
    return client.get<RawDoctor>(`/api/doctors/${id}/`).then((r) => normalizeDoctor(r.data));
  },

  getSpecialties() {
    return client.get('/api/specialties/').then((r) =>
      getResults(r.data).map((s: any) => ({
        id: String(s.id),
        name: s.name,
        nameAr: s.name,
        doctorCount: s.doctor_count || 0,
      })),
    );
  },

  getProfile() {
    return client.get('/api/patients/profile/').then((r) => r.data);
  },

  updateProfile(data: Record<string, unknown>) {
    return client.patch('/api/patients/profile/', data).then((r) => r.data);
  },

  bookAppointment(data: Record<string, unknown>) {
    return client.post('/api/appointments/', data).then((r) => r.data);
  },

  getAppointments() {
    return Promise.all([client.get('/api/appointments/'), this.getDoctors()]).then(([appointmentsRes, doctors]) =>
      getResults(appointmentsRes.data).map((a: any) => normalizeAppointment(a, doctors)),
    );
  },
};
