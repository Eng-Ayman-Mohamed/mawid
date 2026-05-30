from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from users.models import CustomUser
from users.permissions import IsAdminRole
from doctors.models import Doctor, Specialty
from patients.models import Appointment, Patient

from .serializers import (
    AdminUserSerializer,
    SpecialtySerializer,
    AdminAppointmentSerializer
)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        monthly_appointments = (
            Appointment.objects.annotate(month=TruncMonth("appointment_date"))
            .values("month")
            .annotate(appointments=Count("id"))
            .order_by("month")
        )
        monthly_patients = (
            Patient.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(patients=Count("id"))
            .order_by("month")
        )

        monthly = {}
        for row in monthly_appointments:
            if row["month"]:
                key = row["month"].strftime("%Y-%m")
                monthly.setdefault(key, {"month": key, "appointments": 0, "patients": 0})
                monthly[key]["appointments"] = row["appointments"]
        for row in monthly_patients:
            if row["month"]:
                key = row["month"].strftime("%Y-%m")
                monthly.setdefault(key, {"month": key, "appointments": 0, "patients": 0})
                monthly[key]["patients"] = row["patients"]

        return Response({
            "stats": {
                "total_users": CustomUser.objects.count(),
                "total_doctors": Doctor.objects.count(),
                "total_patients": Patient.objects.count(),
                "total_appointments": Appointment.objects.count(),
                "pending_doctors": CustomUser.objects.filter(role="doctor", is_approved=False).count(),
                "blocked_users": CustomUser.objects.filter(is_blocked=True).count(),
            },
            "monthly": [monthly[key] for key in sorted(monthly)],
        })


#  USER MANAGEMENT

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "patch", "delete"]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_approved", "is_blocked", "is_active"]
    search_fields = ["email"]
    ordering_fields = ["id", "email", "role"]
    ordering = ["id"]

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
        user.is_active = False
        user.save()
        return Response({"message": "User blocked successfully"})

    @action(detail=True, methods=["patch"])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.is_active = True
        user.save()
        return Response({"message": "User unblocked successfully"})


# SPECIALTY CRUD

class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.annotate(doctor_count=Count("doctor")).order_by("name")
    serializer_class = SpecialtySerializer
    permission_classes = [IsAdminRole]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "doctor_count"]
    ordering = ["name"]



#  VIEW ALL APPOINTMENTS

class AdminAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "doctor__specialty", "patient", "patient__user")
    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "appointment_date", "doctor", "patient"]
    search_fields = ["patient__user__email", "doctor__user__email", "doctor__specialty__name"]
    ordering_fields = ["appointment_date", "appointment_time", "created_at", "status"]
    ordering = ["-appointment_date", "-appointment_time"]

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        appointment = self.get_object()
        next_status = request.data.get("status")
        valid_statuses = {choice[0] for choice in Appointment._meta.get_field("status").choices}
        if next_status not in valid_statuses:
            return Response(
                {"status": f"Must be one of: {', '.join(sorted(valid_statuses))}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.status = next_status
        appointment.save(update_fields=["status"])
        return Response(self.get_serializer(appointment).data)
