from django.urls import path
from .views import AppointmentView, CancelAppointmentView, RescheduleAppointmentView
from doctors.views import AppointmentStatusUpdateView

urlpatterns = [
    path('', AppointmentView.as_view(), name='appointments'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='cancel-appointment'),
    path('<int:pk>/reschedule/', RescheduleAppointmentView.as_view(), name='reschedule-appointment'),
    path('<int:pk>/status/', AppointmentStatusUpdateView.as_view(), name='appointment-status'),
]
