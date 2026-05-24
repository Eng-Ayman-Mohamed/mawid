from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Patient, Appointment
from .serializers import PatientProfileSerializer, AppointmentBookingSerializer


class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        patient_profile, created = Patient.objects.get_or_create(user=self.request.user)
        return patient_profile
    
class BookAppointmentView(generics.CreateAPIView):
    serializer_class = AppointmentBookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        patient_profile = Patient.objects.get(user=self.request.user)
        serializer.save(patient=patient_profile)
