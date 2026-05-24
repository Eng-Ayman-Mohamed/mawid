from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = Patient
        fields = ['id', 'email', 'date_of_birth', 'phone', 'address']
        read_only_fields = ['id']
