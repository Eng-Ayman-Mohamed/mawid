from datetime import time, date, timedelta

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CustomUser, UserRole
from .models import Doctor, DoctorAvailability, Specialty
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


class DoctorModelTests(TestCase):
    def test_doctor_str(self):
        user = make_user('doc@test.com', role=UserRole.DOCTOR, is_approved=True,
                         first_name='Ali', last_name='Hassan')
        doctor = Doctor.objects.create(user=user)
        self.assertIn('Dr.', str(doctor))
        self.assertIn('Ali Hassan', str(doctor))

    def test_specialty_str(self):
        specialty = Specialty.objects.create(name='Cardiology')
        self.assertEqual(str(specialty), 'Cardiology')

    def test_availability_str(self):
        doctor = make_doctor()
        slot = DoctorAvailability.objects.create(
            doctor=doctor, day='MON', start_time=time(9, 0), end_time=time(17, 0)
        )
        self.assertIn('MON', str(slot))
        self.assertIn('09:00:00', str(slot))

    def test_doctor_default_experience_zero(self):
        doctor = make_doctor()
        self.assertEqual(doctor.years_of_experience, 0)

    def test_doctor_bio_default_blank(self):
        doctor = make_doctor()
        self.assertEqual(doctor.bio, '')

    def test_unique_doctor_day_constraint(self):
        doctor = make_doctor()
        DoctorAvailability.objects.create(
            doctor=doctor, day='MON', start_time=time(9, 0), end_time=time(17, 0)
        )
        with self.assertRaises(Exception):
            DoctorAvailability.objects.create(
                doctor=doctor, day='MON', start_time=time(10, 0), end_time=time(14, 0)
            )


class DoctorListTests(TestCase):
    def setUp(self):
        self.specialty = Specialty.objects.create(name='Cardiology')
        self.doctor = make_doctor()
        self.doctor.specialty = self.specialty
        self.doctor.save()

    def test_list_doctors_public(self):
        res = APIClient().get('/api/doctors/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_list_doctors_returns_availability(self):
        DoctorAvailability.objects.create(
            doctor=self.doctor, day='MON', start_time=time(9, 0), end_time=time(17, 0)
        )
        res = APIClient().get(f'/api/doctors/{self.doctor.pk}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('availability', res.data)

    def test_filter_by_specialty(self):
        res = APIClient().get(f'/api/doctors/?specialty={self.specialty.pk}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_search_by_name(self):
        self.doctor.user.first_name = 'Ali'
        self.doctor.user.save()
        res = APIClient().get('/api/doctors/?search=Ali')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_specialty_list_public(self):
        res = APIClient().get('/api/specialties/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class DoctorProfileTests(TestCase):
    def setUp(self):
        self.doctor = make_doctor()
        self.client = auth_client(self.doctor.user)

    def test_get_profile(self):
        res = self.client.get('/api/doctors/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_profile(self):
        res = self.client.patch('/api/doctors/profile/', {'bio': 'Experienced doctor'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.doctor.refresh_from_db()
        self.assertEqual(self.doctor.bio, 'Experienced doctor')

    def test_non_doctor_cannot_access_profile(self):
        patient_user = make_user('patient@test.com')
        res = auth_client(patient_user).get('/api/doctors/profile/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class DoctorAvailabilityTests(TestCase):
    def setUp(self):
        self.doctor = make_doctor()
        self.client = auth_client(self.doctor.user)

    def test_create_availability(self):
        res = self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '09:00', 'end_time': '17:00'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_list_availability(self):
        self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '09:00', 'end_time': '17:00'
        })
        res = self.client.get('/api/doctors/availability/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_overlap_rejected(self):
        self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '09:00', 'end_time': '17:00'
        })
        res = self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '10:00', 'end_time': '14:00'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_start_after_end_rejected(self):
        res = self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '17:00', 'end_time': '09:00'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_availability(self):
        slot = DoctorAvailability.objects.create(
            doctor=self.doctor, day='MON', start_time=time(9, 0), end_time=time(17, 0)
        )
        res = self.client.delete(f'/api/doctors/availability/{slot.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_overlapping_accepted(self):
        self.client.post('/api/doctors/availability/', {
            'day': 'MON', 'start_time': '09:00', 'end_time': '12:00'
        })
        res = self.client.post('/api/doctors/availability/', {
            'day': 'TUE', 'start_time': '09:00', 'end_time': '17:00'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


class DoctorAppointmentTests(TestCase):
    def setUp(self):
        self.doctor = make_doctor()
        self.patient_user = make_user('patient@test.com', first_name='Ali', last_name='Hassan')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=date.today() + timedelta(days=(0 - date.today().weekday()) % 7 or 7),
            appointment_time=time(10, 0),
        )
        self.client = auth_client(self.doctor.user)

    def test_list_appointments(self):
        res = self.client.get('/api/doctors/appointments/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_appointment_status(self):
        res = self.client.patch(
            f'/api/appointments/{self.appointment.pk}/status/',
            {'status': 'confirmed'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, 'confirmed')

    def test_reject_appointment(self):
        res = self.client.patch(
            f'/api/appointments/{self.appointment.pk}/status/',
            {'status': 'rejected'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, 'cancelled')
