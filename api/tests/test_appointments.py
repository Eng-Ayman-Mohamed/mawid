import pytest
from datetime import date, timedelta

from appointments.models import Appointment
from tests.factories import AppointmentFactory


def next_weekday(weekday=0):
    today = date.today()
    days  = weekday - today.weekday()
    if days <= 0:
        days += 7
    return today + timedelta(days=days)


@pytest.mark.django_db
class TestBooking:
    def test_patient_can_book(self, auth, patient, doctor):
        resp = auth(patient.user).post('/api/appointments/', {
            'doctor': doctor.id, 'patient': patient.id,
            'date': next_weekday(0).isoformat(), 'time_slot': '10:00', 'reason': 'Headache',
        }, format='json')
        assert resp.status_code == 201
        assert Appointment.objects.count() == 1

    def test_double_booking_rejected(self, auth, patient, doctor):
        d = next_weekday(0)
        AppointmentFactory(doctor=doctor, date=d, time_slot='10:00')
        resp = auth(patient.user).post('/api/appointments/', {
            'doctor': doctor.id, 'patient': patient.id,
            'date': d.isoformat(), 'time_slot': '10:00', 'reason': 'X',
        }, format='json')
        assert resp.status_code == 400
        assert 'time_slot' in resp.json()

    def test_past_date_rejected(self, auth, patient, doctor):
        resp = auth(patient.user).post('/api/appointments/', {
            'doctor': doctor.id, 'patient': patient.id,
            'date': (date.today() - timedelta(days=1)).isoformat(),
            'time_slot': '10:00', 'reason': 'X',
        }, format='json')
        assert resp.status_code == 400

    def test_outside_availability_rejected(self, auth, patient, doctor):
        sunday = next_weekday(6)
        resp = auth(patient.user).post('/api/appointments/', {
            'doctor': doctor.id, 'patient': patient.id,
            'date': sunday.isoformat(), 'time_slot': '10:00', 'reason': 'X',
        }, format='json')
        assert resp.status_code == 400

    def test_blocked_doctor_cannot_be_booked(self, auth, patient, doctor):
        doctor.user.is_blocked = True
        doctor.user.save()
        resp = auth(patient.user).post('/api/appointments/', {
            'doctor': doctor.id, 'patient': patient.id,
            'date': next_weekday(0).isoformat(), 'time_slot': '10:00', 'reason': 'X',
        }, format='json')
        assert resp.status_code == 400


@pytest.mark.django_db
class TestStatusTransition:
    def test_doctor_can_accept(self, auth, doctor, patient):
        appt = AppointmentFactory(doctor=doctor, patient=patient, date=next_weekday(0))
        resp = auth(doctor.user).patch(
            f'/api/appointments/{appt.id}/status/', {'status': 'accepted'}, format='json'
        )
        assert resp.status_code == 200
        appt.refresh_from_db()
        assert appt.status == 'accepted'

    def test_invalid_transition_rejected(self, auth, doctor, patient):
        appt = AppointmentFactory(doctor=doctor, patient=patient, date=next_weekday(0), status='completed')
        resp = auth(doctor.user).patch(
            f'/api/appointments/{appt.id}/status/', {'status': 'pending'}, format='json'
        )
        assert resp.status_code == 400

    def test_patient_cannot_accept(self, auth, doctor, patient):
        appt = AppointmentFactory(doctor=doctor, patient=patient, date=next_weekday(0))
        resp = auth(patient.user).patch(
            f'/api/appointments/{appt.id}/status/', {'status': 'accepted'}, format='json'
        )
        assert resp.status_code == 403
