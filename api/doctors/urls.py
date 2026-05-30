from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorViewSet,
    DoctorAvailabilityViewSet,
    DoctorProfileUpdateView,
    DoctorAppointmentListView,
)

router = DefaultRouter()
router.register(r'', DoctorViewSet, basename='doctor')
router.register(r'availability', DoctorAvailabilityViewSet, basename='availability')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', DoctorProfileUpdateView.as_view(), name='doctor-profile'),
    path('appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
]
