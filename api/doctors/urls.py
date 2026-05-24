from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, DoctorAvailabilityViewSet, SpecialtyViewSet

router = DefaultRouter()
router.register('specialties', SpecialtyViewSet, basename='specialty')
router.register('availability', DoctorAvailabilityViewSet, basename='availability')
router.register('', DoctorViewSet, basename='doctor')

urlpatterns = router.urls
