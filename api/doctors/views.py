from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor, DoctorAvailability, Specialty
from .serializers import (
    DoctorSerializer, DoctorAvailabilitySerializer,
    DoctorProfileUpdateSerializer, AppointmentStatusSerializer, SpecialtySerializer
)
from patients.models import Appointment
from .serializers import AppointmentSerializer
from users.permissions import IsAdminRole, IsDoctorRole


# ─── 1. GET /api/doctors/ — List with filters
# ─── 2. GET /api/doctors/{id}/ — Detail + availability
class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.select_related('user', 'specialty').prefetch_related('availability')
    serializer_class = DoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialty']
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name']
    permission_classes = [permissions.IsAuthenticated]


# ─── 3. PATCH /api/doctors/profile/ — Doctor updates own profile
class DoctorProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileUpdateSerializer
    permission_classes = [IsDoctorRole]

    def get_object(self):
        # Always returns the logged-in doctor's own profile
        return self.request.user.doctor_profile


# ─── 4. POST /api/doctors/availability/ — Add slot
# ─── 5. DELETE /api/doctors/availability/{id}/ — Remove slot
class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsDoctorRole]
    http_method_names = ['get', 'post', 'delete']  # no PUT/PATCH on slots

    def get_queryset(self):
        return DoctorAvailability.objects.filter(doctor__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)


# ─── 6. GET /api/doctors/appointments/ — Doctor sees their appointments
class DoctorAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctorRole]

    def get_queryset(self):
        return Appointment.objects.filter(
            doctor=self.request.user.doctor_profile
        ).select_related('patient__user').order_by('-appointment_date')


# ─── GET /api/specialties/ — public list; POST/PUT/DELETE — admin only
class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all().order_by('name')
    serializer_class = SpecialtySerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [permissions.AllowAny()]
        return [IsAdminRole()]


# ─── 7. PATCH /api/appointments/{id}/status/ — Confirm / reject + notes
class AppointmentStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AppointmentStatusSerializer
    permission_classes = [IsDoctorRole]
    http_method_names = ['patch']

    def get_queryset(self):
        # Doctor can only update their own appointments
        return Appointment.objects.filter(doctor=self.request.user.doctor_profile)