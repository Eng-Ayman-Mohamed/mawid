from rest_framework import permissions

class IsPatientRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            

        return getattr(request.user, 'role', None) == 'patient'


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or getattr(request.user, 'role', None) == 'admin':
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'patient'):
            return obj.patient.user == request.user

        return False