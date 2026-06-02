import client from './http/client';
import { normalizeDoctor, type NormalizedDoctor, type RawDoctor } from '../utils/normalizers/doctor';
import { normalizeAppointment, type NormalizedAppointment } from '../utils/normalizers/appointment';

function getResults<T>(data: T): T extends { results: infer R } ? R : T[] {
  return (Array.isArray(data) ? data : (data as any)?.results || []) as any;
}

export interface DoctorProfile {
  id: string;
  bio: string;
  contact: string;
  years_of_experience: number;
  profile_picture: string | null;
  specialty: string;
  specialty_id: number | null;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_approved: boolean;
    is_blocked: boolean;
  };
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: number;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start_time: string;
  end_time: string;
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientBloodGroup: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
}

export interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  uniquePatients: number;
}

function normalizeRawAppointment(raw: any): DoctorAppointment {
  const patient = raw.patient || {};
  const patientUser = patient.user || {};
  const patientName =
    patientUser.first_name || patientUser.last_name
      ? `${patientUser.first_name || ''} ${patientUser.last_name || ''}`.trim()
      : patientUser.email || patient.email || 'Unknown Patient';

  return {
    id: String(raw.id),
    patientId: String(patient.id || ''),
    patientName,
    patientEmail: patientUser.email || patient.email || '',
    patientPhone: patient.phone || '',
    patientBloodGroup: patient.blood_group || '',
    date: raw.appointment_date || '',
    time: raw.appointment_time || '',
    status: raw.status || 'pending',
    notes: raw.notes || null,
    createdAt: raw.created_at || '',
  };
}

export const doctorService = {
  // GET /api/doctors/profile/
  getProfile(): Promise<DoctorProfile> {
    return client.get<any>('/api/doctors/profile/').then((r) => {
      const data = r.data;
      return {
        id: String(data.id || ''),
        bio: data.bio || '',
        contact: data.contact || '',
        years_of_experience: data.years_of_experience || 0,
        profile_picture: data.profile_picture || null,
        specialty: data.specialty_name || '',
        specialty_id: data.specialty_id ?? null,
        user: {
          id: data.user?.id || 0,
          email: data.user?.email || '',
          first_name: data.user?.first_name || '',
          last_name: data.user?.last_name || '',
          role: data.user?.role || 'doctor',
          is_approved: data.is_approved ?? false,
          is_blocked: data.user?.is_blocked ?? false,
        },
        availability: data.availability || [],
      };
    });
  },

  // PATCH /api/doctors/profile/
  updateProfile(data: {
    bio?: string;
    contact?: string;
    years_of_experience?: number;
    profile_picture?: File | null;
    specialty_id?: number | null;
  }): Promise<DoctorProfile> {
    // Use FormData if a file is included
    if (data.profile_picture instanceof File) {
      const form = new FormData();
      if (data.bio !== undefined) form.append('bio', data.bio);
      if (data.contact !== undefined) form.append('contact', data.contact);
      if (data.years_of_experience !== undefined)
        form.append('years_of_experience', String(data.years_of_experience));
      if (data.specialty_id !== undefined)
        form.append('specialty_id', String(data.specialty_id));
      form.append('profile_picture', data.profile_picture);
      return client
        .patch('/api/doctors/profile/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    }

    const payload: Record<string, unknown> = {};
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.contact !== undefined) payload.contact = data.contact;
    if (data.years_of_experience !== undefined)
      payload.years_of_experience = data.years_of_experience;
    if (data.specialty_id !== undefined)
      payload.specialty_id = data.specialty_id;
    // sending null explicitly clears the picture
    if (data.profile_picture === null) payload.profile_picture = null;

    return client.patch('/api/doctors/profile/', payload).then((r) => r.data);
  },

  // GET /api/doctors/appointments/
  getAppointments(): Promise<DoctorAppointment[]> {
  return client
    .get('/api/doctors/appointments/')
    .then((r) => {
      return (getResults(r.data) as any[]).map(normalizeRawAppointment);
    });
},

  // PATCH /api/appointments/{id}/status/
  updateAppointmentStatus(
    id: string,
    status: 'confirmed' | 'rejected' | 'cancelled',
    notes?: string,
  ): Promise<DoctorAppointment> {
    const payload: Record<string, unknown> = { status };
    if (notes !== undefined && notes.trim() !== '') payload.notes = notes;
    return client
      .patch(`/api/appointments/${id}/status/`, payload)
      .then((r) => r.data);
  },

  // GET /api/doctors/availability/
  getAvailability(): Promise<AvailabilitySlot[]> {
    return client
      .get('/api/doctors/availability/')
      .then((r) => getResults(r.data) as AvailabilitySlot[]);
  },

  // POST /api/doctors/availability/
  addAvailability(data: {
    day: string;
    start_time: string;
    end_time: string;
  }): Promise<AvailabilitySlot> {
    return client.post('/api/doctors/availability/', data).then((r) => r.data);
  },

  // DELETE /api/doctors/availability/{id}/
  deleteAvailability(id: number): Promise<void> {
    return client.delete(`/api/doctors/availability/${id}/`).then(() => undefined);
  },

  // Derived: compute stats from appointments list
  computeStats(appointments: DoctorAppointment[]): DoctorStats {
    const today = new Date().toISOString().split('T')[0];
    const uniquePatientIds = new Set(appointments.map((a) => a.patientId));

    return {
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter((a) => a.date === today).length,
      pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
      confirmedAppointments: appointments.filter((a) => a.status === 'confirmed').length,
      completedAppointments: appointments.filter((a) => a.status === 'completed').length,
      cancelledAppointments: appointments.filter((a) => a.status === 'cancelled').length,
      uniquePatients: uniquePatientIds.size,
    };
  },
};
