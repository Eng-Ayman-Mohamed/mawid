from django.db import models
from django.conf import settings

class Patient(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    
    phone           = models.CharField(max_length=15, blank=True)
    date_of_birth   = models.DateField(blank=True, null=True)
    address         = models.TextField(blank=True)
    blood_group     = models.CharField(max_length=5, blank=True)
    medical_history = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Patient Profile: {self.user.email}"
    

class AppointmentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'

class Appointment(models.Model):
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, related_name='appointments')   
    # doctors model name check
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()  
    notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=15, 
        choices=AppointmentStatus.choices, 
        default=AppointmentStatus.PENDING
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appt: {self.patient} with Dr. {self.doctor} on {self.appointment_date} at {self.appointment_time}"
