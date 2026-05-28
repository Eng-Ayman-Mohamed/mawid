import { createBrowserRouter } from 'react-router';

// Patient Portal
import { PatientLanding } from './pages/patient/Landing';
import { PatientLogin } from './pages/patient/Login';
import { PatientRegister } from './pages/patient/Register';
import { DoctorList } from './pages/patient/DoctorList';
import { DoctorProfile } from './pages/patient/DoctorProfile';
import { BookAppointment } from './pages/patient/BookAppointment';
import { MyAppointments } from './pages/patient/MyAppointments';
import { PatientProfile } from './pages/patient/PatientProfile';

// Doctor Portal
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorAvailability } from './pages/doctor/Availability';
import { DoctorAppointments } from './pages/doctor/Appointments';
import { DoctorProfileEdit } from './pages/doctor/ProfileEdit';
import { DoctorLogin } from './pages/doctor/Login';

// Admin Portal
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminSpecialties } from './pages/admin/Specialties';
import { AdminAppointments } from './pages/admin/Appointments';
import { AdminLogin } from './pages/admin/Login';

export const router = createBrowserRouter([
  // Patient Routes
  {
    path: '/',
    Component: PatientLanding,
  },
  {
    path: '/login',
    Component: PatientLogin,
  },
  {
    path: '/register',
    Component: PatientRegister,
  },
  {
    path: '/doctors',
    Component: DoctorList,
  },
  {
    path: '/doctors/:id',
    Component: DoctorProfile,
  },
  {
    path: '/book/:doctorId',
    Component: BookAppointment,
  },
  {
    path: '/my-appointments',
    Component: MyAppointments,
  },
  {
    path: '/profile',
    Component: PatientProfile,
  },
  
  // Doctor Routes
  {
    path: '/doctor/login',
    Component: DoctorLogin,
  },
  {
    path: '/doctor/dashboard',
    Component: DoctorDashboard,
  },
  {
    path: '/doctor/availability',
    Component: DoctorAvailability,
  },
  {
    path: '/doctor/appointments',
    Component: DoctorAppointments,
  },
  {
    path: '/doctor/profile',
    Component: DoctorProfileEdit,
  },
  
  // Admin Routes
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
  },
  {
    path: '/admin/users',
    Component: AdminUsers,
  },
  {
    path: '/admin/specialties',
    Component: AdminSpecialties,
  },
  {
    path: '/admin/appointments',
    Component: AdminAppointments,
  },
]);
