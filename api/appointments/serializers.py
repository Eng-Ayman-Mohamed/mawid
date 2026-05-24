from rest_framework import serializers
from django.utils import timezone

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Appointment
        fields = ['id', 'doctor', 'patient', 'date', 'time_slot', 'status', 'reason', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('Cannot book a date in the past.')
        return value

    def validate(self, attrs):
        doctor    = attrs.get('doctor')    or getattr(self.instance, 'doctor', None)
        patient   = attrs.get('patient')   or getattr(self.instance, 'patient', None)
        date      = attrs.get('date')      or getattr(self.instance, 'date', None)
        time_slot = attrs.get('time_slot') or getattr(self.instance, 'time_slot', None)

        # Double-booking check
        qs = Appointment.objects.filter(
            doctor=doctor, date=date, time_slot=time_slot
        ).exclude(status=Appointment.Status.REJECTED)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError({'time_slot': 'This slot is already booked.'})

        # Doctor must be approved and not blocked
        if doctor and (not doctor.user.is_approved or doctor.user.is_blocked):
            raise serializers.ValidationError(
                {'doctor': 'This doctor is not currently accepting appointments.'}
            )

        # Doctor and patient cannot be the same user
        if doctor and patient and doctor.user_id == patient.user_id:
            raise serializers.ValidationError(
                {'patient': 'Doctor and patient cannot be the same user.'}
            )

        return attrs


class AppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Appointment.Status.choices)
