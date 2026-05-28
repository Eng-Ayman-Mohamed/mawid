export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Doctor {
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
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientNameAr: string;
  doctorId: string;
  doctorName: string;
  doctorNameAr: string;
  specialty: string;
  specialtyAr: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface Specialty {
  id: string;
  name: string;
  nameAr: string;
  doctorCount: number;
}

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'pending' | 'blocked';
  joinDate: string;
}

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    nameAr: 'د. سارة جونسون',
    specialty: 'Cardiology',
    specialtyAr: 'القلب',
    rating: 4.9,
    experience: 15,
    patients: 2500,
    bio: 'Specialized in cardiovascular diseases with over 15 years of experience in treating heart conditions.',
    bioAr: 'متخصصة في أمراض القلب والأوعية الدموية مع أكثر من 15 عاماً من الخبرة في علاج أمراض القلب.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Ahmed Hassan',
    nameAr: 'د. أحمد حسن',
    specialty: 'Dermatology',
    specialtyAr: 'الجلدية',
    rating: 4.8,
    experience: 12,
    patients: 1800,
    bio: 'Expert dermatologist focusing on skin health, cosmetic procedures, and treating complex skin conditions.',
    bioAr: 'طبيب جلدية خبير متخصص في صحة الجلد والإجراءات التجميلية وعلاج الأمراض الجلدية المعقدة.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    nameAr: 'د. إيميلي تشن',
    specialty: 'Neurology',
    specialtyAr: 'الأعصاب',
    rating: 4.9,
    experience: 18,
    patients: 2200,
    bio: 'Leading neurologist specializing in brain and nervous system disorders with cutting-edge treatment approaches.',
    bioAr: 'طبيبة أعصاب رائدة متخصصة في اضطرابات الدماغ والجهاز العصبي مع أساليب علاج متطورة.',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    available: true,
  },
  {
    id: '4',
    name: 'Dr. Michael Brown',
    nameAr: 'د. مايكل براون',
    specialty: 'Pediatrics',
    specialtyAr: 'الأطفال',
    rating: 4.7,
    experience: 10,
    patients: 3000,
    bio: 'Compassionate pediatrician dedicated to providing comprehensive healthcare for children of all ages.',
    bioAr: 'طبيب أطفال رحيم مكرس لتقديم رعاية صحية شاملة للأطفال من جميع الأعمار.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    available: false,
  },
  {
    id: '5',
    name: 'Dr. Fatima Al-Sayed',
    nameAr: 'د. فاطمة السيد',
    specialty: 'Orthopedics',
    specialtyAr: 'العظام',
    rating: 4.8,
    experience: 14,
    patients: 1900,
    bio: 'Orthopedic surgeon with expertise in joint replacement, sports injuries, and musculoskeletal conditions.',
    bioAr: 'جراحة عظام خبيرة في استبدال المفاصل وإصابات الرياضة وحالات الجهاز العضلي الهيكلي.',
    image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop',
    available: true,
  },
  {
    id: '6',
    name: 'Dr. David Miller',
    nameAr: 'د. ديفيد ميلر',
    specialty: 'Psychiatry',
    specialtyAr: 'الطب النفسي',
    rating: 4.9,
    experience: 20,
    patients: 1500,
    bio: 'Experienced psychiatrist specializing in mental health treatment, therapy, and holistic wellness approaches.',
    bioAr: 'طبيب نفسي ذو خبرة متخصص في علاج الصحة النفسية والعلاج النفسي والأساليب الشاملة للعافية.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    available: true,
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'p-1',
    patientName: 'John Smith',
    patientNameAr: 'جون سميث',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorNameAr: 'د. سارة جونسون',
    specialty: 'Cardiology',
    specialtyAr: 'القلب',
    date: '2026-05-30',
    time: '10:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-2',
    patientId: 'p-1',
    patientName: 'John Smith',
    patientNameAr: 'جون سميث',
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    doctorNameAr: 'د. أحمد حسن',
    specialty: 'Dermatology',
    specialtyAr: 'الجلدية',
    date: '2026-06-02',
    time: '2:30 PM',
    status: 'pending',
  },
  {
    id: 'apt-3',
    patientId: 'p-2',
    patientName: 'Lisa Anderson',
    patientNameAr: 'ليزا أندرسون',
    doctorId: '3',
    doctorName: 'Dr. Emily Chen',
    doctorNameAr: 'د. إيميلي تشن',
    specialty: 'Neurology',
    specialtyAr: 'الأعصاب',
    date: '2026-05-29',
    time: '11:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-4',
    patientId: 'p-1',
    patientName: 'John Smith',
    patientNameAr: 'جون سميث',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorNameAr: 'د. سارة جونسون',
    specialty: 'Cardiology',
    specialtyAr: 'القلب',
    date: '2026-05-15',
    time: '3:00 PM',
    status: 'completed',
  },
  {
    id: 'apt-5',
    patientId: 'p-1',
    patientName: 'John Smith',
    patientNameAr: 'جون سميث',
    doctorId: '4',
    doctorName: 'Dr. Michael Brown',
    doctorNameAr: 'د. مايكل براون',
    specialty: 'Pediatrics',
    specialtyAr: 'الأطفال',
    date: '2026-05-20',
    time: '9:00 AM',
    status: 'cancelled',
  },
];

export const mockSpecialties: Specialty[] = [
  { id: 's-1', name: 'Cardiology', nameAr: 'القلب', doctorCount: 45 },
  { id: 's-2', name: 'Dermatology', nameAr: 'الجلدية', doctorCount: 38 },
  { id: 's-3', name: 'Neurology', nameAr: 'الأعصاب', doctorCount: 32 },
  { id: 's-4', name: 'Pediatrics', nameAr: 'الأطفال', doctorCount: 56 },
  { id: 's-5', name: 'Orthopedics', nameAr: 'العظام', doctorCount: 41 },
  { id: 's-6', name: 'Psychiatry', nameAr: 'الطب النفسي', doctorCount: 28 },
];

export const mockUsers: User[] = [
  {
    id: 'u-1',
    name: 'Dr. Sarah Johnson',
    nameAr: 'د. سارة جونسون',
    email: 'sarah.johnson@medical.com',
    role: 'doctor',
    status: 'active',
    joinDate: '2024-01-15',
  },
  {
    id: 'u-2',
    name: 'John Smith',
    nameAr: 'جون سميث',
    email: 'john.smith@email.com',
    role: 'patient',
    status: 'active',
    joinDate: '2025-03-20',
  },
  {
    id: 'u-3',
    name: 'Dr. Ahmed Hassan',
    nameAr: 'د. أحمد حسن',
    email: 'ahmed.hassan@medical.com',
    role: 'doctor',
    status: 'pending',
    joinDate: '2026-05-10',
  },
  {
    id: 'u-4',
    name: 'Lisa Anderson',
    nameAr: 'ليزا أندرسون',
    email: 'lisa.anderson@email.com',
    role: 'patient',
    status: 'active',
    joinDate: '2025-11-05',
  },
];
