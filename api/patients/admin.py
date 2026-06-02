from django.contrib import admin

from .models import Patient, Appointment


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'blood_group', 'created_at']
    search_fields = ['user__email', 'phone']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'appointment_date', 'appointment_time', 'status']
    list_filter = ['status', 'appointment_date']
    search_fields = ['patient__user__email', 'doctor__user__email']
