from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from .models import CustomUser, CustomUserManager, UserRole


class CustomUserModelTests(TestCase):
    def test_create_patient(self):
        user = CustomUser.objects.create_user(
            email='patient@test.com', password='pass1234', role=UserRole.PATIENT
        )
        self.assertEqual(user.role, 'patient')
        self.assertFalse(user.is_approved)
        self.assertFalse(user.is_blocked)
        self.assertTrue(user.is_active)

    def test_create_doctor(self):
        user = CustomUser.objects.create_user(
            email='doctor@test.com', password='pass1234', role=UserRole.DOCTOR
        )
        self.assertEqual(user.role, 'doctor')

    def test_create_admin(self):
        user = CustomUser.objects.create_user(
            email='admin@test.com', password='pass1234', role=UserRole.ADMIN
        )
        self.assertEqual(user.role, 'admin')

    def test_create_superuser(self):
        admin = CustomUser.objects.create_superuser(
            email='super@test.com', password='pass1234'
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_approved)
        self.assertEqual(admin.role, 'admin')

    def test_email_required(self):
        with self.assertRaises(ValueError):
            CustomUser.objects.create_user(email='', password='pass1234')

    def test_duplicate_email_raises(self):
        CustomUser.objects.create_user(email='dup@test.com', password='pass1234')
        with self.assertRaises(IntegrityError):
            CustomUser.objects.create_user(email='dup@test.com', password='pass1234')

    def test_get_full_name(self):
        user = CustomUser(
            email='test@test.com', first_name='Ali', last_name='Hassan'
        )
        self.assertEqual(user.get_full_name(), 'Ali Hassan')

    def test_get_full_name_empty(self):
        user = CustomUser(email='test@test.com')
        self.assertEqual(user.get_full_name(), '')

    def test_get_short_name_returns_email(self):
        user = CustomUser(email='test@test.com')
        self.assertEqual(user.get_short_name(), 'test@test.com')

    def test_str_representation(self):
        user = CustomUser(email='test@test.com', role=UserRole.PATIENT)
        self.assertEqual(str(user), 'test@test.com (patient)')

    def test_is_approved_defaults_false(self):
        user = CustomUser.objects.create_user(
            email='new@test.com', password='pass1234', role=UserRole.DOCTOR
        )
        self.assertFalse(user.is_approved)

    def test_is_blocked_defaults_false(self):
        user = CustomUser.objects.create_user(
            email='new@test.com', password='pass1234', role=UserRole.PATIENT
        )
        self.assertFalse(user.is_blocked)

    def test_username_field_is_email(self):
        self.assertEqual(CustomUser.USERNAME_FIELD, 'email')

    def test_required_fields_include_role(self):
        self.assertIn('role', CustomUser.REQUIRED_FIELDS)
