from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UserRole(models.TextChoices):
    ADMIN   = 'admin',   'Admin'
    DOCTOR  = 'doctor',  'Doctor'
    PATIENT = 'patient', 'Patient'


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    role        = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.PATIENT)
    email       = models.EmailField(unique=True)
    is_approved = models.BooleanField(default=False)
    is_blocked  = models.BooleanField(default=False)
    is_active   = models.BooleanField(default=True)   
    is_staff    = models.BooleanField(default=False)  

    objects = CustomUserManager()                      

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['role']                         