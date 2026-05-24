from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema

from .models import Doctor, DoctorAvailability, Specialty
from .serializers import DoctorSerializer, DoctorAvailabilitySerializer, SpecialtySerializer


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Doctor.objects.select_related('user', 'specialty').prefetch_related('availabilities')
        if self.request.user.role != 'admin':
            qs = qs.filter(user__is_approved=True, user__is_blocked=False)
        return qs

    @extend_schema(summary='List approved doctors')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Retrieve a doctor profile')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class   = DoctorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DoctorAvailability.objects.filter(doctor__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

    @extend_schema(summary='List own availability slots')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Add an availability slot')
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Specialty.objects.all()
    serializer_class   = SpecialtySerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary='List all specialties')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
