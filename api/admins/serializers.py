from rest_framework import serializers
from users.models import CustomUser
from doctors.models import Specialty
from appointments.models import Appointment



# USERS (Admin View)

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "role",
            "is_approved",
            "is_blocked",
            "is_active",
            "is_staff",
        ]


# SPECIALTY

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = "__all__"


# APPOINTMENTS

class AdminAppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.StringRelatedField()
    patient = serializers.StringRelatedField()

    class Meta:
        model = Appointment
        fields = "__all__"