from django.urls import path
from .views import PatientProfileView, BookAppointmentView

urlpatterns = [
    path('profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),
]