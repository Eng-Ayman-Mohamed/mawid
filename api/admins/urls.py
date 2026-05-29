from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    AdminDashboardView,
    AdminUserViewSet,
    SpecialtyViewSet,
    AdminAppointmentViewSet
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'specialties', SpecialtyViewSet, basename='specialties')
router.register(r'appointments', AdminAppointmentViewSet, basename='admin-appointments')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    *router.urls,
]
