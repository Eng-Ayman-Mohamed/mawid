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

    def validate(self, data):
        day = data.get('day')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("Start time must be before end time.")

        doctor = self.context['request'].user.doctor_profile
        overlapping = DoctorAvailability.objects.filter(
            doctor=doctor,
            day=day,
            start_time__lt=end_time,
            end_time__gt=start_time,
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError(
                "This time slot overlaps with an existing availability entry."
            )

        return data


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
    status = serializers.CharField()

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