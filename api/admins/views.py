from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.models import CustomUser
from users.permissions import IsAdminRole
from doctors.models import Specialty
from appointments.models import Appointment

from .serializers import (
    AdminUserSerializer,
    SpecialtySerializer,
    AdminAppointmentSerializer
)


#  USER MANAGEMENT

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "patch", "delete"]

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        user = self.get_object()
        user.is_approved = True
        user.save()
        return Response({"message": "User approved successfully"})

    @action(detail=True, methods=["patch"])
    def block(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = True
        user.save()
        return Response({"message": "User blocked successfully"})

    @action(detail=True, methods=["patch"])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.save()
        return Response({"message": "User unblocked successfully"})


# SPECIALTY CRUD

class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAdminRole]



#  VIEW ALL APPOINTMENTS

class AdminAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "patient")
    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAdminRole]