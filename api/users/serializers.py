from rest_framework import serializers
from .models import CustomUser, UserRole


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = CustomUser
        fields = ['email', 'password', 'role']

    def validate_role(self, value):
        if value == UserRole.ADMIN:
            raise serializers.ValidationError('Cannot self-register as admin.')
        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'role', 'is_approved', 'is_blocked']