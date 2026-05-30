from rest_framework import serializers
from .models import Doctor, DoctorAvailability, Specialty
from patients.models import Appointment
from users.serializers import UserSerializer
from patients.serializers import PatientProfileSerializer


# ─── Specialty serializer (public read, admin write)
class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Specialty
        fields = ['id', 'name', 'description']


# ─── Availability serializer
class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'day', 'start_time', 'end_time']


# ─── Doctor list / detail serializer
class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialty = serializers.StringRelatedField()
    availability = DoctorAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialty', 'bio', 'contact', 'profile_picture', 'years_of_experience', 'availability']


# ─── Doctor updates only these fields on their own profile
class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['bio', 'contact', 'years_of_experience', 'profile_picture']


# ─── Appointment serializer used in doctor views
class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── Status update serializer (used for confirm/reject)
class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'notes']

    def validate_status(self, value):
        # Accept 'rejected' from the client and map it to the model's 'cancelled' status
        allowed = ['confirmed', 'rejected', 'cancelled']
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {allowed}")
        if value == 'rejected':
            return 'cancelled'
        return value