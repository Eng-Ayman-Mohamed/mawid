from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor, DoctorAvailability
from .serializers import DoctorSerializer, DoctorAvailabilitySerializer
from users.permissions import IsAdminRole, IsDoctorRole 
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user', 'specialty').prefetch_related('availability')
    serializer_class = DoctorSerializer

    # Search by name, filter by specialty
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialty']
    search_fields = ['user__first_name', 'user__last_name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Anyone logged in can browse doctors
            return [permissions.IsAuthenticated()]
        # Only admin can create/update/delete doctor profiles
        return [IsAdminRole()]  # M1's custom permission


class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorAvailabilitySerializer

    def get_queryset(self):
        # Doctors only see/edit their own availability
        return DoctorAvailability.objects.filter(doctor__user=self.request.user)

    def get_permissions(self):
        return [IsDoctorRole()]  # M1's custom permission

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)