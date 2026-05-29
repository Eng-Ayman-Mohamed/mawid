from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/admin/', include('admins.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/auth/', include('users.urls')),
    path('api/doctors/', include('doctors.urls')),
]
