import pytest
from django.contrib.auth import get_user_model
from tests.factories import UserFactory

User = get_user_model()


@pytest.mark.django_db
class TestRegistration:
    def test_patient_registers_successfully(self, api):
        resp = api.post('/api/auth/register/', {
            'email': 'patient@test.com', 'password': 'Test1234!', 'role': 'patient',
        }, format='json')
        assert resp.status_code == 201
        assert User.objects.filter(email='patient@test.com').exists()

    def test_doctor_registers_as_pending(self, api):
        resp = api.post('/api/auth/register/', {
            'email': 'doc@test.com', 'password': 'Test1234!', 'role': 'doctor',
        }, format='json')
        assert resp.status_code == 201
        assert User.objects.get(email='doc@test.com').is_approved is False

    def test_cannot_register_as_admin(self, api):
        resp = api.post('/api/auth/register/', {
            'email': 'hacker@test.com', 'password': 'Test1234!', 'role': 'admin',
        }, format='json')
        assert resp.status_code == 400

    def test_duplicate_email_rejected(self, db, api):
        UserFactory(email='dup@test.com')
        resp = api.post('/api/auth/register/', {
            'email': 'dup@test.com', 'password': 'Test1234!', 'role': 'patient',
        }, format='json')
        assert resp.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_valid_login_returns_tokens(self, api):
        UserFactory(email='login@test.com', is_approved=True)
        resp = api.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'Test1234!',
        }, format='json')
        assert resp.status_code == 200
        assert 'access' in resp.data and 'refresh' in resp.data

    def test_wrong_password_rejected(self, db, api):
        UserFactory(email='wrong@test.com')
        resp = api.post('/api/auth/login/', {
            'email': 'wrong@test.com', 'password': 'BadPass!',
        }, format='json')
        assert resp.status_code == 401

    def test_blocked_user_cannot_login(self, db, api):
        UserFactory(email='blocked@test.com', is_blocked=True)
        resp = api.post('/api/auth/login/', {
            'email': 'blocked@test.com', 'password': 'Test1234!',
        }, format='json')
        assert resp.status_code == 403

    def test_unapproved_doctor_cannot_login(self, db, api):
        UserFactory(email='pending@test.com', role='doctor', is_approved=False)
        resp = api.post('/api/auth/login/', {
            'email': 'pending@test.com', 'password': 'Test1234!',
        }, format='json')
        assert resp.status_code == 403

    def test_me_requires_auth(self, api):
        resp = api.get('/api/auth/me/')
        assert resp.status_code == 401
