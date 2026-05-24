from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiExample

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusSerializer

ALLOWED_TRANSITIONS = {
    'pending':   {'accepted', 'rejected'},
    'accepted':  {'completed', 'rejected'},
    'rejected':  set(),
    'completed': set(),
}


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class   = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Appointment.objects.select_related('doctor__user', 'patient__user')
        if user.role == 'patient':
            return qs.filter(patient__user=user)
        if user.role == 'doctor':
            return qs.filter(doctor__user=user)
        return qs  # admin sees all

    @extend_schema(
        summary='Book a new appointment',
        description="Patient submits a booking request. Status starts as 'pending'.",
        responses={201: AppointmentSerializer, 400: None},
        examples=[OpenApiExample(
            'Booking example',
            value={'doctor': 1, 'patient': 1, 'date': '2026-06-01', 'time_slot': '10:00', 'reason': 'Headache'},
            request_only=True,
        )],
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Update appointment status',
        description='Doctor accepts/rejects/completes. Validates allowed transitions.',
        request=AppointmentStatusSerializer,
        responses={200: AppointmentSerializer, 400: None},
    )
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        serializer  = AppointmentStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status  = serializer.validated_data['status']

        user = request.user
        if user.role == 'doctor':
            allowed = {'accepted', 'rejected', 'completed'}
        elif user.role == 'patient':
            allowed = {'rejected'}
        else:
            allowed = set(Appointment.Status.values)

        if new_status not in allowed:
            return Response(
                {'detail': 'You do not have permission to set this status.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        current = appointment.status
        if new_status != current and new_status not in ALLOWED_TRANSITIONS.get(current, set()):
            raise ValidationError({'status': f'Cannot transition from {current!r} to {new_status!r}.'})

        appointment.status = new_status
        appointment.save(update_fields=['status'])
        return Response(AppointmentSerializer(appointment).data)
