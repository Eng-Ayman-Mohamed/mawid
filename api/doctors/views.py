from rest_framework import viewsets, permissions, filters, generics
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor, DoctorAvailability, Specialty
from .serializers import (
    DoctorSerializer,
    DoctorAvailabilitySerializer,
    DoctorProfileUpdateSerializer,
    AppointmentStatusSerializer,
    AppointmentSerializer,          # ← single clean import
    SpecialtySerializer,
)
from patients.models import Appointment
from users.permissions import IsAdminRole, IsDoctorRole


# ─── 1. GET /api/doctors/ — List with filters
# ─── 2. GET /api/doctors/{id}/ — Detail + availability
class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.select_related('user', 'specialty').prefetch_related('availability').order_by('id')
    serializer_class = DoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialty']
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ─── 3. PATCH /api/doctors/profile/ — Doctor updates own profile
class DoctorProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileUpdateSerializer
    permission_classes = [IsDoctorRole]

    def get_object(self):
        profile, _ = Doctor.objects.get_or_create(user=self.request.user)
        return profile


# ─── 4. POST /api/doctors/availability/ — Add slot
# ─── 5. DELETE /api/doctors/availability/{id}/ — Remove slot
class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsDoctorRole]
    http_method_names = ['get', 'post', 'delete']
    lookup_value_regex = r'[0-9]+'

    def get_queryset(self):
        doctor, _ = Doctor.objects.get_or_create(user=self.request.user)
        return DoctorAvailability.objects.filter(doctor=doctor).order_by('day', 'start_time')

    def perform_create(self, serializer):
        doctor, _ = Doctor.objects.get_or_create(user=self.request.user)
        serializer.save(doctor=doctor)


# ─── 6. GET /api/doctors/appointments/ — Doctor sees their appointments
class DoctorAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctorRole]

    def get_queryset(self):
        doctor, _ = Doctor.objects.get_or_create(user=self.request.user)
        return Appointment.objects.filter(
            doctor=doctor
        ).select_related('patient__user').order_by('-appointment_date')


# ─── GET /api/specialties/ — public list; POST/PUT/DELETE — admin only
class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all().order_by('name')
    serializer_class = SpecialtySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [IsAdminRole()]


# ─── 7. PATCH /api/appointments/{id}/status/ — Confirm / cancel / complete
class AppointmentStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AppointmentStatusSerializer
    permission_classes = [IsDoctorRole]
    http_method_names = ['patch']

    def get_queryset(self):
        doctor, _ = Doctor.objects.get_or_create(user=self.request.user)
        return Appointment.objects.filter(doctor=doctor)