from datetime import date, time, timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CustomUser, UserRole
from doctors.models import Doctor, Specialty, DoctorAvailability
from patients.models import Patient, Appointment


def make_user(email, role=UserRole.PATIENT, password='pass1234', **kwargs):
    user = CustomUser.objects.create_user(email=email, password=password, role=role, **kwargs)
    if role != UserRole.DOCTOR:
        user.is_approved = True
        user.save()
    return user


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(token.access_token)}')
    return client


def make_doctor(email='doctor@test.com'):
    specialty, _ = Specialty.objects.get_or_create(name='General')
    user = make_user(email, role=UserRole.DOCTOR, is_approved=True)
    return Doctor.objects.create(user=user, specialty=specialty)


def next_monday():
    today = date.today()
    days_ahead = (0 - today.weekday()) % 7
    return today + timedelta(days=days_ahead or 7)


class AdminDashboardTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin@test.com', role=UserRole.ADMIN)
        self.client = auth_client(self.admin)

    def test_dashboard_returns_stats(self):
        make_doctor('doc1@test.com')
        res = self.client.get('/api/admin/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('stats', res.data)
        self.assertIn('monthly', res.data)
        self.assertEqual(res.data['stats']['total_doctors'], 1)

    def test_non_admin_cannot_access_dashboard(self):
        patient_user = make_user('patient@test.com')
        res = auth_client(patient_user).get('/api/admin/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_counts_users(self):
        res = self.client.get('/api/admin/dashboard/')
        self.assertIn('total_users', res.data['stats'])


class AdminUserManagementTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin@test.com', role=UserRole.ADMIN)
        self.client = auth_client(self.admin)
        self.doctor = make_doctor('pending@test.com')
        self.doctor.user.is_approved = False
        self.doctor.user.save()

    def test_list_users(self):
        res = self.client.get('/api/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_users_by_role(self):
        res = self.client.get('/api/admin/users/?role=doctor')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_approve_doctor(self):
        res = self.client.patch(f'/api/admin/users/{self.doctor.user.pk}/approve/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.doctor.user.refresh_from_db()
        self.assertTrue(self.doctor.user.is_approved)

    def test_block_user(self):
        res = self.client.patch(f'/api/admin/users/{self.doctor.user.pk}/block/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.doctor.user.refresh_from_db()
        self.assertTrue(self.doctor.user.is_blocked)
        self.assertFalse(self.doctor.user.is_active)

    def test_unblock_user(self):
        self.doctor.user.is_blocked = True
        self.doctor.user.is_active = False
        self.doctor.user.save()
        res = self.client.patch(f'/api/admin/users/{self.doctor.user.pk}/unblock/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.doctor.user.refresh_from_db()
        self.assertFalse(self.doctor.user.is_blocked)
        self.assertTrue(self.doctor.user.is_active)

    def test_admin_cannot_block_self(self):
        res = self.client.patch(f'/api/admin/users/{self.admin.pk}/block/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_user(self):
        other = make_user('delete@test.com')
        res = self.client.delete(f'/api/admin/users/{other.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_admin_cannot_delete_self(self):
        res = self.client.delete(f'/api/admin/users/{self.admin.pk}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_admin_cannot_manage_users(self):
        patient_user = make_user('patient@test.com')
        res = auth_client(patient_user).get('/api/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class AdminSpecialtyTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin@test.com', role=UserRole.ADMIN)
        self.client = auth_client(self.admin)

    def test_create_specialty(self):
        res = self.client.post('/api/admin/specialties/', {
            'name': 'Neurology', 'description': 'Brain and nerves'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Specialty.objects.count(), 1)

    def test_list_specialties_includes_doctor_count(self):
        Specialty.objects.create(name='Cardiology')
        res = self.client.get('/api/admin/specialties/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('doctor_count', res.data['results'][0])

    def test_non_admin_cannot_create_specialty(self):
        patient_user = make_user('patient@test.com')
        res = auth_client(patient_user).post('/api/admin/specialties/', {
            'name': 'Test', 'description': ''
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_all_specialties(self):
        Specialty.objects.create(name='Cardiology')
        Specialty.objects.create(name='Dermatology')
        res = self.client.get('/api/admin/specialties/')
        self.assertEqual(res.data['count'], 2)


class AdminAppointmentTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin@test.com', role=UserRole.ADMIN)
        self.client = auth_client(self.admin)
        self.doctor = make_doctor()
        self.patient_user = make_user('patient@test.com')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=next_monday(),
            appointment_time=time(10, 0),
        )

    def test_list_appointments(self):
        res = self.client.get('/api/admin/appointments/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_appointments_by_status(self):
        res = self.client.get('/api/admin/appointments/?status=pending')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_status(self):
        res = self.client.patch(
            f'/api/admin/appointments/{self.appointment.pk}/status/',
            {'status': 'confirmed'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, 'confirmed')

    def test_invalid_status_rejected(self):
        res = self.client.patch(
            f'/api/admin/appointments/{self.appointment.pk}/status/',
            {'status': 'nonexistent'}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
