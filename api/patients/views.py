from django.db import transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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


class BookAppointmentView(generics.CreateAPIView):
    serializer_class = AppointmentBookingSerializer
    permission_classes = [IsAuthenticated, IsPatientRole]

    def perform_create(self, serializer):
        with transaction.atomic():
            doctor = serializer.validated_data['doctor']
            appt_date = serializer.validated_data['appointment_date']
            appt_time = serializer.validated_data['appointment_time']

            # Layer 3 — acquire a row lock on the doctor to serialise concurrent requests
            Doctor.objects.select_for_update().get(pk=doctor.pk)

            # Re-check for a conflict under the lock (guards against race conditions)
            if Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appt_date,
                appointment_time=appt_time,
            ).exclude(status='cancelled').exists():
                raise ValidationError("This doctor is already booked at the same time and date.")

            patient_profile = Patient.objects.get(user=self.request.user)
            serializer.save(patient=patient_profile)


class CancelAppointmentView(APIView):
    permission_classes = [IsAuthenticated, IsPatientRole]

    def post(self, request, pk):
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

    def get_queryset(self):
        patient_profile = Patient.objects.get(user=self.request.user)
        return Appointment.objects.filter(patient=patient_profile)

    def perform_update(self, serializer):
        serializer.save(status='pending')


class PatientAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentBookingSerializer
    permission_classes = [IsAuthenticated, IsPatientRole]

    def get_queryset(self):
        patient_profile = Patient.objects.get(user=self.request.user)
        return Appointment.objects.filter(patient=patient_profile).order_by('appointment_date', 'appointment_time')
