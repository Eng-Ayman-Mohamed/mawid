from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema

from .models import Patient
from .serializers import PatientSerializer


class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        patient, _ = Patient.objects.get_or_create(user=self.request.user)
        return patient

    @extend_schema(summary='Get own patient profile')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(summary='Update own patient profile')
    def patch(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
