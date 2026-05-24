import pytest
from tests.factories import DoctorFactory, UserFactory


@pytest.mark.django_db
class TestDoctorList:
    def test_only_approved_doctors_visible_to_patient(self, auth, patient):
        DoctorFactory(user=UserFactory(role='doctor', is_approved=True))
        DoctorFactory(user=UserFactory(role='doctor', is_approved=False))
        resp = auth(patient.user).get('/api/doctors/')
        assert resp.status_code == 200
        assert len(resp.data) == 1

    def test_blocked_doctor_not_visible(self, auth, patient):
        DoctorFactory(user=UserFactory(role='doctor', is_approved=True, is_blocked=True))
        resp = auth(patient.user).get('/api/doctors/')
        assert resp.status_code == 200
        assert len(resp.data) == 0

    def test_admin_sees_all_doctors(self, auth, admin_user):
        DoctorFactory(user=UserFactory(role='doctor', is_approved=True))
        DoctorFactory(user=UserFactory(role='doctor', is_approved=False))
        resp = auth(admin_user).get('/api/doctors/')
        assert resp.status_code == 200
        assert len(resp.data) == 2

    def test_unauthenticated_request_denied(self, api):
        resp = api.get('/api/doctors/')
        assert resp.status_code == 401
