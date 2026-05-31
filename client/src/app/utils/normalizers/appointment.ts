import type { NormalizedDoctor, RawDoctor } from './doctor';

interface RawAppointment {
  id: number;
  doctor?: number;
  doctor_id?: number;
  patient?: { id?: number; email?: string };
  patient_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  status?: string;
  notes?: string;
  specialty?: string;
}

export interface NormalizedAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientNameAr: string;
  doctorId: string;
  doctorName: string;
  doctorNameAr: string;
  specialty: string;
  specialtyAr: string;
  date?: string;
  time?: string;
  status?: string;
  notes?: string;
}

export function normalizeAppointment(
  appointment: RawAppointment,
  doctors: NormalizedDoctor[] = [],
): NormalizedAppointment {
  const doctor =
    doctors.find((item) => String(item.id) === String(appointment.doctor)) ||
    doctors.find((item) => String(item.id) === String(appointment.doctor_id));
  const patientEmail = appointment.patient?.email || appointment.patient || 'Patient';
  const doctorName = doctor?.name || String(appointment.doctor || appointment.doctor_id || 'Doctor');

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
