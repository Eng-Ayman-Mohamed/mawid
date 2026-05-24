from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        ACCEPTED  = 'accepted',  'Accepted'
        REJECTED  = 'rejected',  'Rejected'
        COMPLETED = 'completed', 'Completed'

    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    date      = models.DateField()
    time_slot = models.TimeField()
    status    = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reason    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'date', 'time_slot'],
                name='unique_doctor_slot',
            ),
        ]

    def __str__(self):
        return f'{self.patient} -> {self.doctor} on {self.date} at {self.time_slot}'

    def clean(self):
        errors = {}

        if self.date and self.date < timezone.localdate():
            errors['date'] = 'Appointment date cannot be in the past.'

        if self.doctor_id and self.patient_id and self.doctor.user_id == self.patient.user_id:
            errors['patient'] = 'A doctor cannot book an appointment with themselves.'

        if self.doctor_id and self.date and self.time_slot:
            weekday = self.date.weekday()
            in_window = self.doctor.availabilities.filter(
                weekday=weekday,
                start_time__lte=self.time_slot,
                end_time__gt=self.time_slot,
            ).exists()
            if not in_window:
                errors['time_slot'] = 'Doctor is not available at this time.'

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
