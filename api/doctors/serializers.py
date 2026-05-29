from rest_framework import serializers
from .models import Doctor, DoctorAvailability

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'day', 'start_time', 'end_time']


class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    availability = DoctorAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'email', 'specialty', 'specialty_name',
            'bio', 'phone', 'years_of_experience', 'profile_picture', 'availability'
        ]