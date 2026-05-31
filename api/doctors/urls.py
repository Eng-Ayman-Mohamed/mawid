from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorViewSet,
    DoctorAvailabilityViewSet,
    DoctorProfileUpdateView,
    DoctorAppointmentListView,
)

router = DefaultRouter()
router.register(r'availability', DoctorAvailabilityViewSet, basename='availability')

urlpatterns = [
    path('profile/', DoctorProfileUpdateView.as_view(), name='doctor-profile'),
    path('appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
    path('', DoctorViewSet.as_view({'get': 'list'}), name='doctor-list'),
    path('<int:pk>/', DoctorViewSet.as_view({'get': 'retrieve'}), name='doctor-detail'),
    path('', include(router.urls)),
]
