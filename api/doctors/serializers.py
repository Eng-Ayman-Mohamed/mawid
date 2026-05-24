from rest_framework import serializers
from .models import Doctor, DoctorAvailability, Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name']


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'weekday', 'start_time', 'end_time']


class DoctorSerializer(serializers.ModelSerializer):
    availabilities  = DoctorAvailabilitySerializer(many=True, read_only=True)
    specialty_name  = serializers.CharField(source='specialty.name', read_only=True)
    email           = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = Doctor
        fields = ['id', 'email', 'specialty', 'specialty_name', 'bio', 'license_number', 'availabilities']
        read_only_fields = ['id']
