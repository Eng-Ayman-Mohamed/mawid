import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      'API request failed';
    return Promise.reject(new Error(message));
  }
);

function getResults(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function formatDoctorName(doctor) {
  return doctor?.user?.email ? `Dr. ${doctor.user.email}` : `Dr. ${doctor?.id || ''}`;
}

function normalizeDoctor(doctor) {
  const name = formatDoctorName(doctor);

  return {
    id: String(doctor.id),
    name,
    nameAr: name,
    specialty: doctor.specialty || '',
    specialtyAr: doctor.specialty || '',
    rating: 0,
    experience: doctor.years_of_experience || 0,
    patients: 0,
    bio: doctor.bio || '',
    bioAr: doctor.bio || '',
    image: doctor.profile_picture || '',
    available: Boolean(doctor.availability?.length),
    phone: doctor.phone || '',
    email: doctor.user?.email || '',
    availability: doctor.availability || [],
  };
}

function normalizeAppointment(appointment, doctors = []) {
  const doctor =
    doctors.find((item) => String(item.id) === String(appointment.doctor)) ||
    doctors.find((item) => String(item.id) === String(appointment.doctor_id));
  const patientEmail = appointment.patient?.email || appointment.patient || 'Patient';
  const doctorName = doctor?.name || appointment.doctor || 'Doctor';

  return {
    id: String(appointment.id),
    patientId: String(appointment.patient?.id || appointment.patient_id || ''),
    patientName: patientEmail,
    patientNameAr: patientEmail,
    doctorId: String(appointment.doctor || appointment.doctor_id || doctor?.id || ''),
    doctorName,
    doctorNameAr: doctorName,
    specialty: doctor?.specialty || appointment.specialty || '',
    specialtyAr: doctor?.specialty || appointment.specialty || '',
    date: appointment.appointment_date,
    time: appointment.appointment_time,
    status: appointment.status,
    notes: appointment.notes,
  };
}

export const apiService = {
  login(email, password) {
    return api.post('/api/auth/login/', { email, password });
  },

  register(data) {
    return api.post('/api/auth/register/', data);
  },

  getDoctors(params = {}) {
    return api.get('/api/doctors/doctors/', { params }).then((data) => getResults(data).map(normalizeDoctor));
  },

  getDoctor(id) {
    return api.get(`/api/doctors/doctors/${id}/`).then(normalizeDoctor);
  },

  getSpecialties() {
    return this.getDoctors().then((doctors) => {
      const names = [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))];
      return names.map((name) => ({ id: name, name, nameAr: name, doctorCount: doctors.filter((doctor) => doctor.specialty === name).length }));
    });
  },

  getPatientProfile() {
    return api.get('/api/patients/profile/');
  },

  updatePatientProfile(data) {
    return api.patch('/api/patients/profile/', data);
  },

  bookAppointment(data) {
    return api.post('/api/patients/appointments/book/', data);
  },

  getPatientAppointments() {
    return Promise.all([
      api.get('/api/patients/appointments/'),
      this.getDoctors(),
    ]).then(([appointments, doctors]) => getResults(appointments).map((appointment) => normalizeAppointment(appointment, doctors)));
  },

  getDoctorProfile() {
    return api.get('/api/doctors/doctors/profile/').then(normalizeDoctor);
  },

  updateDoctorProfile(data) {
    return api.patch('/api/doctors/doctors/profile/', data);
  },

  getDoctorAppointments() {
    return Promise.all([
      api.get('/api/doctors/doctors/appointments/'),
      this.getDoctors(),
    ]).then(([appointments, doctors]) => getResults(appointments).map((appointment) => normalizeAppointment(appointment, doctors)));
  },

  updateDoctorAppointmentStatus(id, data) {
    return api.patch(`/api/doctors/appointments/${id}/status/`, data);
  },
};
