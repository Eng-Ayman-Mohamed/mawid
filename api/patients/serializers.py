from rest_framework import serializers
from .models import Patient, Appointment
from doctors.models import DoctorAvailability

# weekday() → DoctorAvailability day code
_WEEKDAY_TO_CODE = {0: 'MON', 1: 'TUE', 2: 'WED', 3: 'THU', 4: 'FRI', 5: 'SAT', 6: 'SUN'}


class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'email', 'phone_number', 'date_of_birth', 'blood_group', 'medical_history', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'appointment_date', 'appointment_time', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, data):
        doctor           = data['doctor']
        appointment_date = data['appointment_date']
        appointment_time = data['appointment_time']

        # Layer 1 — does this datetime fall within a declared availability slot?
        day_code = _WEEKDAY_TO_CODE[appointment_date.weekday()]
        slot_exists = DoctorAvailability.objects.filter(
            doctor=doctor,
            day=day_code,
            start_time__lte=appointment_time,
            end_time__gt=appointment_time,
        ).exists()
        if not slot_exists:
            raise serializers.ValidationError(
                "The doctor is not available on this day or at this time."
            )

        # Layer 2 — is the slot already taken?
        conflict = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
        ).exclude(status='cancelled').exists()
        if conflict:
            raise serializers.ValidationError(
                "This doctor is already booked at the same time and date."
            )

        return data
    
class AppointmentRescheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['appointment_date', 'appointment_time']

    def validate(self, data):
        appointment = self.instance 
        doctor = appointment.doctor
        new_date = data['appointment_date']
        new_time = data['appointment_time']

        if appointment.status in ['completed', 'cancelled']:
            raise serializers.ValidationError(
                f"Cannot reschedule an appointment that is already {appointment.status}."
            )

        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=new_date,
            appointment_time=new_time
        ).exclude(id=appointment.id).exclude(status='cancelled').exists()

        if existing_appointment:
            raise serializers.ValidationError(
                "This doctor is already booked for this new date and time slot."
            )

        return data