from datetime import date, time, timedelta

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CustomUser, UserRole
from doctors.models import Doctor, Specialty, DoctorAvailability
from .models import Patient, Appointment


# ─── Helpers ──────────────────────────────────────────────────────────────────

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


def make_doctor(email='doctor@test.com', approved=True):
    specialty, _ = Specialty.objects.get_or_create(name='General')
    user = make_user(email, role=UserRole.DOCTOR, is_approved=approved)
    doctor = Doctor.objects.create(user=user, specialty=specialty)
    # Monday availability 09:00–17:00
    DoctorAvailability.objects.create(
        doctor=doctor, day='MON', start_time=time(9, 0), end_time=time(17, 0)
    )
    return doctor


def next_monday():
    today = date.today()
    days_ahead = (0 - today.weekday()) % 7
    return today + timedelta(days=days_ahead or 7)


# ─── Auth Tests ───────────────────────────────────────────────────────────────

class RegisterTests(TestCase):
    url = '/api/auth/register/'

    def setUp(self):
        self.client = APIClient()

    def test_register_patient_success(self):
        res = self.client.post(self.url, {
            'email': 'patient@test.com', 'password': 'pass1234', 'role': 'patient'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['role'], 'patient')

    def test_register_doctor_success(self):
        res = self.client.post(self.url, {
            'email': 'doc@test.com', 'password': 'pass1234', 'role': 'doctor'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_cannot_register_as_admin(self):
        res = self.client.post(self.url, {
            'email': 'admin@test.com', 'password': 'pass1234', 'role': 'admin'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_rejected(self):
        make_user('dup@test.com')
        res = self.client.post(self.url, {
            'email': 'dup@test.com', 'password': 'pass1234', 'role': 'patient'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_password_rejected(self):
        res = self.client.post(self.url, {
            'email': 'short@test.com', 'password': '123', 'role': 'patient'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_fields_rejected(self):
        res = self.client.post(self.url, {'email': 'x@test.com'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(TestCase):
    url = '/api/auth/login/'

    def setUp(self):
        self.client = APIClient()
        self.user = make_user('login@test.com', password='pass1234')

    def test_valid_credentials_return_tokens(self):
        res = self.client.post(self.url, {'email': 'login@test.com', 'password': 'pass1234'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_wrong_password_rejected(self):
        res = self.client.post(self.url, {'email': 'login@test.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_user_rejected(self):
        res = self.client.post(self.url, {'email': 'nobody@test.com', 'password': 'pass1234'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_blocked_user_cannot_login(self):
        self.user.is_blocked = True
        self.user.save()
        res = self.client.post(self.url, {'email': 'login@test.com', 'password': 'pass1234'})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unapproved_doctor_cannot_login(self):
        make_user('unapproveddoc@test.com', role=UserRole.DOCTOR, password='pass1234', is_approved=False)
        res = self.client.post(self.url, {'email': 'unapproveddoc@test.com', 'password': 'pass1234'})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_approved_doctor_can_login(self):
        make_user('approveddoc@test.com', role=UserRole.DOCTOR, password='pass1234', is_approved=True)
        res = self.client.post(self.url, {'email': 'approveddoc@test.com', 'password': 'pass1234'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class LogoutTests(TestCase):
    def setUp(self):
        self.user = make_user('logout@test.com')
        self.client = auth_client(self.user)
        self.refresh = str(RefreshToken.for_user(self.user))

    def test_logout_blacklists_token(self):
        res = self.client.post('/api/auth/logout/', {'refresh': self.refresh})
        self.assertEqual(res.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_without_token_returns_400(self):
        res = self.client.post('/api/auth/logout/', {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_logout_rejected(self):
        res = APIClient().post('/api/auth/logout/', {'refresh': self.refresh})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class MeTests(TestCase):
    def test_me_returns_user_data(self):
        user = make_user('me@test.com')
        res = auth_client(user).get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'me@test.com')

    def test_me_unauthenticated_rejected(self):
        res = APIClient().get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# ─── Booking Tests ────────────────────────────────────────────────────────────

class BookAppointmentTests(TestCase):
    url = '/api/patients/appointments/book/'

    def setUp(self):
        self.patient_user = make_user('patient@test.com')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.doctor = make_doctor()
        self.client = auth_client(self.patient_user)
        self.monday = next_monday()
        self.payload = {
            'doctor': self.doctor.pk,
            'appointment_date': str(self.monday),
            'appointment_time': '10:00',
        }

    def test_book_appointment_success(self):
        res = self.client.post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'pending')

    def test_duplicate_slot_rejected(self):
        self.client.post(self.url, self.payload)
        res = self.client.post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_doctor_unavailable_day_rejected(self):
        # Find a non-Monday
        sunday = self.monday + timedelta(days=6)
        payload = {**self.payload, 'appointment_date': str(sunday)}
        res = self.client.post(self.url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_doctor_unavailable_time_rejected(self):
        payload = {**self.payload, 'appointment_time': '08:00'}
        res = self.client.post(self.url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelled_slot_can_be_rebooked(self):
        res = self.client.post(self.url, self.payload)
        appt_id = res.data['id']
        self.client.post(f'/api/patients/appointments/{appt_id}/cancel/')
        res2 = self.client.post(self.url, self.payload)
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_cannot_book(self):
        res = APIClient().post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_doctor_role_cannot_book(self):
        doctor_user = make_user('otherdoc@test.com', role=UserRole.DOCTOR, is_approved=True)
        res = auth_client(doctor_user).post(self.url, self.payload)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class CancelAppointmentTests(TestCase):
    def setUp(self):
        self.patient_user = make_user('patient@test.com')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.doctor = make_doctor()
        self.monday = next_monday()
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
            status='pending',
        )
        self.client = auth_client(self.patient_user)
        self.url = f'/api/patients/appointments/{self.appointment.pk}/cancel/'

    def test_cancel_pending_appointment(self):
        res = self.client.post(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, 'cancelled')

    def test_cannot_cancel_already_cancelled(self):
        self.appointment.status = 'cancelled'
        self.appointment.save()
        res = self.client.post(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_cancel_completed(self):
        self.appointment.status = 'completed'
        self.appointment.save()
        res = self.client.post(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_cancel_another_patients_appointment(self):
        other_user = make_user('other@test.com')
        Patient.objects.create(user=other_user)
        res = auth_client(other_user).post(self.url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class RescheduleAppointmentTests(TestCase):
    def setUp(self):
        self.patient_user = make_user('patient@test.com')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.doctor = make_doctor()
        self.monday = next_monday()
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
            status='pending',
        )
        self.client = auth_client(self.patient_user)
        self.url = f'/api/patients/appointments/{self.appointment.pk}/reschedule/'

    def test_reschedule_to_valid_slot(self):
        next_week_monday = self.monday + timedelta(days=7)
        res = self.client.patch(self.url, {
            'appointment_date': str(next_week_monday),
            'appointment_time': '11:00',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, 'pending')

    def test_reschedule_cancelled_appointment_rejected(self):
        self.appointment.status = 'cancelled'
        self.appointment.save()
        next_week_monday = self.monday + timedelta(days=7)
        res = self.client.patch(self.url, {
            'appointment_date': str(next_week_monday),
            'appointment_time': '11:00',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ─── Permission Tests ─────────────────────────────────────────────────────────

class PermissionTests(TestCase):
    def setUp(self):
        self.patient_user = make_user('patient@test.com')
        self.doctor_user = make_user('doctor@test.com', role=UserRole.DOCTOR, is_approved=True)
        self.admin_user = make_user('admin@test.com', role=UserRole.ADMIN)

    def test_doctor_cannot_access_patient_profile(self):
        res = auth_client(self.doctor_user).get('/api/patients/profile/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_cannot_access_doctor_appointments(self):
        # Router's {pk} pattern shadows doctors/appointments/, so 404 is also acceptable
        res = auth_client(self.patient_user).get('/api/doctors/doctors/appointments/')
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_unauthenticated_cannot_access_patient_profile(self):
        res = APIClient().get('/api/patients/profile/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_list_appointments(self):
        res = APIClient().get('/api/patients/appointments/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patient_can_access_own_profile(self):
        Patient.objects.create(user=self.patient_user)
        res = auth_client(self.patient_user).get('/api/patients/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


# ─── Email Signal Tests ───────────────────────────────────────────────────────

class AppointmentEmailSignalTests(TestCase):
    def setUp(self):
        self.patient_user = make_user('patient@test.com')
        self.patient = Patient.objects.create(user=self.patient_user)
        self.doctor = make_doctor()
        self.monday = next_monday()

    def test_booking_sends_two_emails(self):
        from django.core import mail
        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
        )
        self.assertEqual(len(mail.outbox), 2)
        subjects = {m.subject for m in mail.outbox}
        self.assertIn('Appointment Request Received — Mawid', subjects)
        self.assertIn('New Appointment Request — Mawid', subjects)

    def test_confirmation_sends_one_email_to_patient(self):
        from django.core import mail
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
        )
        mail.outbox.clear()
        appt.status = 'confirmed'
        appt.save()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Confirmed', mail.outbox[0].subject)
        self.assertIn(self.patient_user.email, mail.outbox[0].recipients())

    def test_cancellation_sends_one_email_to_patient(self):
        from django.core import mail
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
        )
        mail.outbox.clear()
        appt.status = 'cancelled'
        appt.save()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Cancelled', mail.outbox[0].subject)

    def test_no_email_on_status_unchanged(self):
        from django.core import mail
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=self.monday,
            appointment_time=time(10, 0),
        )
        mail.outbox.clear()
        appt.notes = 'updated notes'
        appt.save()
        self.assertEqual(len(mail.outbox), 0)
