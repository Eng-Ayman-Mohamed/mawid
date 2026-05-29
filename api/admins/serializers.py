from rest_framework import serializers
from users.models import CustomUser
from doctors.models import Specialty
from patients.models import Appointment



# USERS (Admin View)

class AdminUserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "role",
            "display_name",
            "status",
            "is_approved",
            "is_blocked",
            "is_active",
            "is_staff",
        ]
        read_only_fields = ["id", "email", "role", "is_staff", "display_name", "status"]

    def get_display_name(self, obj):
        return obj.email

    def get_status(self, obj):
        if obj.is_blocked:
            return "blocked"
        if not obj.is_approved and obj.role == "doctor":
            return "pending"
        if not obj.is_active:
            return "inactive"
        return "active"


# SPECIALTY

class SpecialtySerializer(serializers.ModelSerializer):
    doctor_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Specialty
        fields = ["id", "name", "doctor_count"]


# APPOINTMENTS

class AdminAppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.EmailField(source="doctor.user.email", read_only=True)
    patient = serializers.EmailField(source="patient.user.email", read_only=True)
    specialty = serializers.CharField(source="doctor.specialty.name", read_only=True)
    doctor_id = serializers.IntegerField(source="doctor.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_id",
            "patient",
            "doctor_id",
            "doctor",
            "specialty",
            "appointment_date",
            "appointment_time",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "patient_id",
            "patient",
            "doctor_id",
            "doctor",
            "specialty",
            "appointment_date",
            "appointment_time",
            "notes",
            "created_at",
        ]
