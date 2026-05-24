from django.urls import path

from .views import (
    PatientProfileView, 
    BookAppointmentView, 
    CancelAppointmentView, 
    RescheduleAppointmentView
)

urlpatterns = [
    path('profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('appointments/<int:pk>/cancel/', CancelAppointmentView.as_view(), name='cancel-appointment'),
    path('appointments/<int:pk>/reschedule/', RescheduleAppointmentView.as_view(), name='reschedule-appointment'),
]