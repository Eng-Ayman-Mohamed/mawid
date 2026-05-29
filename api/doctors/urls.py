from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorViewSet,
    DoctorAvailabilityViewSet,
    DoctorProfileUpdateView,
    DoctorAppointmentListView,
    AppointmentStatusUpdateView,
)

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'doctors/availability', DoctorAvailabilityViewSet, basename='availability')

urlpatterns = [
    path('', include(router.urls)),

    # PATCH /api/doctors/profile/
    path('doctors/profile/', DoctorProfileUpdateView.as_view(), name='doctor-profile'),

    # GET /api/doctors/appointments/
    path('doctors/appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),

    # PATCH /api/appointments/{id}/status/
    path('appointments/<int:pk>/status/', AppointmentStatusUpdateView.as_view(), name='appointment-status'),
]