from rest_framework import serializers
from .models import Patient, Appointment

class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'email', 'phone_number', 'date_of_birth', 'blood_group', 'medical_history', 'created_at']
        read_only_fields = ['id', 'created_at']

class AppointmentBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'appointment_date', 'appointment_time', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, data):
        doctor = data['doctor']
        appointment_date = data['appointment_date']
        appointment_time = data['appointment_time']
        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).exclude(status='cancelled').exists()

        if existing_appointment:
            raise serializers.ValidationError(
                "This doctor is already booked at the same time and date."
            )

        return data