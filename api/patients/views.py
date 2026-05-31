from django.db import transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from doctors.models import Doctor
from .models import Patient, Appointment
from .serializers import PatientProfileSerializer, AppointmentBookingSerializer, AppointmentRescheduleSerializer
from .permissions import IsPatientRole, IsOwnerOrAdmin


class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsPatientRole]

    def get_object(self):
        patient_profile, _ = Patient.objects.get_or_create(user=self.request.user)
        self.check_object_permissions(self.request, patient_profile)
        return patient_profile


class AppointmentView(generics.ListCreateAPIView):
    serializer_class = AppointmentBookingSerializer
    permission_classes = [IsAuthenticated, IsPatientRole]

    def get_queryset(self):
        patient_profile = Patient.objects.get(user=self.request.user)
        return Appointment.objects.filter(patient=patient_profile).order_by('appointment_date', 'appointment_time')

    def perform_create(self, serializer):
        user = self.request.user
        first_name = serializer.validated_data.pop('first_name', '').strip()
        last_name  = serializer.validated_data.pop('last_name', '').strip()

        with transaction.atomic():
            doctor     = serializer.validated_data['doctor']
            appt_date  = serializer.validated_data['appointment_date']
            appt_time  = serializer.validated_data['appointment_time']

            Doctor.objects.select_for_update().get(pk=doctor.pk)

            if Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appt_date,
                appointment_time=appt_time,
            ).exclude(status='cancelled').exists():
                raise ValidationError("This doctor is already booked at the same time and date.")

            update_fields = []
            if first_name and not user.first_name:
                user.first_name = first_name
                update_fields.append('first_name')
            if last_name and not user.last_name:
                user.last_name = last_name
                update_fields.append('last_name')
            if update_fields:
                user.save(update_fields=update_fields)

            patient_profile = Patient.objects.get(user=user)
            serializer.save(patient=patient_profile)


@extend_schema(
    request=None,
    responses={200: {'type': 'object', 'properties': {'message': {'type': 'string'}, 'status': {'type': 'string'}}}}
)
class CancelAppointmentView(APIView):
    permission_classes = [IsAuthenticated, IsPatientRole]

    def patch(self, request, pk):
        try:
            patient_profile = Patient.objects.get(user=request.user)
            appointment = Appointment.objects.get(pk=pk, patient=patient_profile)
        except (Patient.DoesNotExist, Appointment.DoesNotExist):
            return Response(
                {"error": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if appointment.status in ('completed', 'cancelled'):
            return Response(
                {"error": f"Cannot cancel an appointment that is already {appointment.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = 'cancelled'
        appointment.save()
        return Response(
            {"message": "Appointment cancelled successfully.", "status": appointment.status},
            status=status.HTTP_200_OK,
        )


class RescheduleAppointmentView(generics.UpdateAPIView):
    serializer_class = AppointmentRescheduleSerializer
    permission_classes = [IsAuthenticated, IsPatientRole, IsOwnerOrAdmin]
    http_method_names = ['patch']

    def get_queryset(self):
        patient_profile = Patient.objects.get(user=self.request.user)
        return Appointment.objects.filter(patient=patient_profile)

    def perform_update(self, serializer):
        serializer.save(status='pending')
