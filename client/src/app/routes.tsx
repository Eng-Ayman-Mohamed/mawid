import { createBrowserRouter } from 'react-router';

// Public pages
import { PatientLanding } from './pages/patient/Landing';
import { DoctorList } from './pages/patient/DoctorList';
import { DoctorProfile } from './pages/patient/DoctorProfile';
import { LoginPage } from './pages/Login';
import { PatientRegister } from './pages/patient/Register';

// Protected pages
import { BookAppointment } from './pages/patient/BookAppointment';
import { MyAppointments } from './pages/patient/MyAppointments';
import { PatientProfile } from './pages/patient/PatientProfile';
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorAvailability } from './pages/doctor/Availability';
import { DoctorAppointments } from './pages/doctor/Appointments';
import { DoctorProfileEdit } from './pages/doctor/ProfileEdit';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminSpecialties } from './pages/admin/Specialties';
import { AdminAppointments } from './pages/admin/Appointments';

// Guards & layouts
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PatientLayout } from './components/layout/PatientLayout';
import { DoctorLayout } from './components/layout/DoctorLayout';
import { AdminLayout } from './components/layout/AdminLayout';

export const router = createBrowserRouter([
  // Public routes
  { path: '/', Component: PatientLanding },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: PatientRegister },
  { path: '/doctors', Component: DoctorList },
  { path: '/doctors/:id', Component: DoctorProfile },

  // Protected patient routes
  {
    element: <ProtectedRoute role="patient" />,
    children: [
      {
        element: <PatientLayout />,
        children: [
          { path: '/book/:doctorId', Component: BookAppointment },
          { path: '/my-appointments', Component: MyAppointments },
          { path: '/profile', Component: PatientProfile },
        ],
      },
    ],
  },

  // Protected doctor routes
  {
    element: <ProtectedRoute role="doctor" />,
    children: [
      {
        element: <DoctorLayout />,
        children: [
          { path: '/doctor/dashboard', Component: DoctorDashboard },
          { path: '/doctor/availability', Component: DoctorAvailability },
          { path: '/doctor/appointments', Component: DoctorAppointments },
          { path: '/doctor/profile', Component: DoctorProfileEdit },
        ],
      },
    ],
  },

  // Protected admin routes
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', Component: AdminDashboard },
          { path: '/admin/users', Component: AdminUsers },
          { path: '/admin/specialties', Component: AdminSpecialties },
          { path: '/admin/appointments', Component: AdminAppointments },
        ],
      },
    ],
  },
]);
