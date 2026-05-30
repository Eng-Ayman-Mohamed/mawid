from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from doctors.views import SpecialtyViewSet

specialty_router = DefaultRouter()
specialty_router.register(r'specialties', SpecialtyViewSet, basename='specialty')

urlpatterns = [
    path('admin/', admin.site.urls),

    # API schema & docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App routes
    path('api/', include(specialty_router.urls)),
    path('api/admin/', include('admins.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('patients.appointment_urls')),
    path('api/auth/', include('users.urls')),
    path('api/doctors/', include('doctors.urls')),
]
