from rest_framework import serializers
from .models import CustomUser, UserRole
from patients.models import Patient
from doctors.models import Doctor


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = CustomUser
        fields = ['email', 'password', 'role', 'first_name', 'last_name']

    def validate_role(self, value):
        if value == UserRole.ADMIN:
            raise serializers.ValidationError('Cannot self-register as admin.')
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        if user.role == UserRole.PATIENT:
            Patient.objects.get_or_create(user=user)
        elif user.role == UserRole.DOCTOR:
            Doctor.objects.get_or_create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_approved', 'is_blocked']