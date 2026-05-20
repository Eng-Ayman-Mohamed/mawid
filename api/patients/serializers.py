from rest_framework import serializers
from .models import Patient

class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'email', 'phone_number', 'date_of_birth', 'blood_group', 'medical_history', 'created_at']
        read_only_fields = ['id', 'created_at']