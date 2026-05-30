from django.db import models
from users.models import CustomUser  # M1's model


class Specialty(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True)
    bio     = models.TextField(blank=True)
    contact = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='doctors/', null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()}"


class DoctorAvailability(models.Model):
    DAYS = [
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday'), ('SUN', 'Sunday'),
    ]
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availability')
    day = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['doctor', 'day'], name='unique_doctor_day')
        ]

    def __str__(self):
        return f"{self.doctor} — {self.day} {self.start_time}–{self.end_time}"