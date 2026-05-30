from django.urls import path
from .views import AppointmentView, CancelAppointmentView, RescheduleAppointmentView

urlpatterns = [
    path('', AppointmentView.as_view(), name='appointments'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='cancel-appointment'),
    path('<int:pk>/reschedule/', RescheduleAppointmentView.as_view(), name='reschedule-appointment'),
]
