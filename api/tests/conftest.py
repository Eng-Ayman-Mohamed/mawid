import pytest
from rest_framework.test import APIClient

from tests.factories import UserFactory, DoctorFactory, PatientFactory, AvailabilityFactory


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return UserFactory(role='admin', is_staff=True, is_superuser=True, is_approved=True)


@pytest.fixture
def doctor(db):
    d = DoctorFactory()
    for weekday in range(5):  # Mon–Fri
        AvailabilityFactory(doctor=d, weekday=weekday, start_time='09:00', end_time='17:00')
    return d


@pytest.fixture
def patient(db):
    return PatientFactory()


@pytest.fixture
def auth(api):
    def _auth(user):
        api.force_authenticate(user=user)
        return api
    return _auth
