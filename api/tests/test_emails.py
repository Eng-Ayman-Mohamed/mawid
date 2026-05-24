import pytest
from datetime import date, timedelta
from django.core import mail

from tests.factories import UserFactory, DoctorFactory, PatientFactory, AvailabilityFactory, AppointmentFactory


def next_weekday(weekday=0):
    today = date.today()
    days  = weekday - today.weekday()
    if days <= 0:
        days += 7
    return today + timedelta(days=days)


@pytest.mark.django_db
def test_welcome_email_sent_on_registration():
    mail.outbox = []
    UserFactory(email='new@test.com', role='patient')
    assert len(mail.outbox) == 1
    assert 'Welcome' in mail.outbox[0].subject
    assert 'new@test.com' in mail.outbox[0].to


@pytest.mark.django_db
def test_doctor_approval_email_sent():
    user = UserFactory(role='doctor', is_approved=False)
    mail.outbox = []
    user.is_approved = True
    user.save()
    assert any('approved' in m.subject.lower() for m in mail.outbox)
    assert any(user.email in m.to for m in mail.outbox)


@pytest.mark.django_db
def test_account_blocked_email_sent():
    user = UserFactory(role='patient', is_blocked=False)
    mail.outbox = []
    user.is_blocked = True
    user.save()
    assert any('suspended' in m.subject.lower() for m in mail.outbox)
    assert any(user.email in m.to for m in mail.outbox)


@pytest.mark.django_db
def test_appointment_created_emails_sent_to_both():
    doctor  = DoctorFactory()
    target  = next_weekday(0)
    AvailabilityFactory(doctor=doctor, weekday=target.weekday())
    patient = PatientFactory()
    mail.outbox = []
    AppointmentFactory(doctor=doctor, patient=patient, date=target, time_slot='10:00')
    recipients = [addr for m in mail.outbox for addr in m.to]
    assert doctor.user.email in recipients
    assert patient.user.email in recipients


@pytest.mark.django_db
def test_status_change_email_sent_to_patient():
    doctor  = DoctorFactory()
    target  = next_weekday(0)
    AvailabilityFactory(doctor=doctor, weekday=target.weekday())
    patient = PatientFactory()
    appt    = AppointmentFactory(doctor=doctor, patient=patient, date=target, time_slot='10:00')
    mail.outbox = []
    appt.status = 'accepted'
    appt.save()
    assert any(patient.user.email in m.to for m in mail.outbox)
