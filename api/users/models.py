from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class UserRole(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    DOCTOR = 'doctor', 'Doctor'
    PATIENT = 'patient', 'Patient'

class CustomUser(AbstractBaseUser, PermissionsMixin):
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.PATIENT)
    email = models.EmailField(unique=True)
    is_approved = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role', 'username']
    