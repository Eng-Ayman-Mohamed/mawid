export interface RawDoctor {
  id: number;
  user?: { first_name?: string; last_name?: string; email?: string };
  specialty?: string;
  years_of_experience?: number;
  bio?: string;
  profile_picture?: string;
  availability?: unknown[];
  contact?: string;
}

export interface NormalizedDoctor {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  rating: number;
  experience: number;
  patients: number;
  bio: string;
  bioAr: string;
  image: string;
  available: boolean;
  contact: string;
  email: string;
  availability: unknown[];
}

function formatDoctorName(doctor: RawDoctor): string {
  const user = doctor?.user;
  if (user?.first_name || user?.last_name) {
    return `Dr. ${[user.first_name, user.last_name].filter(Boolean).join(' ')}`;
  }
  return user?.email ? `Dr. ${user.email}` : `Dr. ${doctor?.id || ''}`;
}

export function normalizeDoctor(doctor: RawDoctor): NormalizedDoctor {
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
    contact: doctor.contact || '',
    email: doctor.user?.email || '',
    availability: doctor.availability || [],
  };
}
