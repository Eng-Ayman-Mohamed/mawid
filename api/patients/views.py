from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientProfileSerializer

class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        patient_profile, created = Patient.objects.get_or_create(user=self.request.user)
        return patient_profile
