from rest_framework.routers import DefaultRouter
from .views import (
    AdminUserViewSet,
    SpecialtyViewSet,
    AdminAppointmentViewSet
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'specialties', SpecialtyViewSet, basename='specialties')
router.register(r'appointments', AdminAppointmentViewSet, basename='admin-appointments')

urlpatterns = router.urls