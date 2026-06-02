from rest_framework.permissions import BasePermission
from .models import UserRole


class IsAdminRole(BasePermission):
    """
    Allow access only to users with role = ADMIN
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.ADMIN
        )

class IsDoctorRole(BasePermission):
    """
    Allow access only to users with role = DOCTOR
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.DOCTOR
        )    