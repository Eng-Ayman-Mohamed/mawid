from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from users.models import CustomUser
from appointments.models import Appointment
from .emails import send_html_email


# ── 1. Welcome email on registration ─────────────────────────────────────────

@receiver(post_save, sender=CustomUser)
def send_welcome_email(sender, instance, created, **kwargs):
    if not created or not instance.email:
        return
    send_html_email(
        subject='Welcome to Mawid',
        template_name='welcome',
        context={'user': instance, 'frontend': getattr(settings, 'FRONTEND_URL', '')},
        to=[instance.email],
    )


# ── 2. Doctor approval / account block ───────────────────────────────────────

@receiver(pre_save, sender=CustomUser)
def cache_previous_user_state(sender, instance, **kwargs):
    if instance.pk:
        try:
            prev = CustomUser.objects.get(pk=instance.pk)
            instance._was_approved = prev.is_approved
            instance._was_blocked  = prev.is_blocked
        except CustomUser.DoesNotExist:
            instance._was_approved = False
            instance._was_blocked  = False
    else:
        instance._was_approved = False
        instance._was_blocked  = False


@receiver(post_save, sender=CustomUser)
def notify_on_approval_or_block(sender, instance, created, **kwargs):
    if created:
        return

    if (
        instance.role == 'doctor'
        and instance.is_approved
        and not getattr(instance, '_was_approved', False)
    ):
        send_html_email(
            subject='Your doctor account has been approved',
            template_name='doctor_approved',
            context={'user': instance, 'frontend': getattr(settings, 'FRONTEND_URL', '')},
            to=[instance.email],
        )

    if instance.is_blocked and not getattr(instance, '_was_blocked', False):
        send_html_email(
            subject='Your Mawid account has been suspended',
            template_name='account_blocked',
            context={'user': instance},
            to=[instance.email],
        )


# ── 3. Appointment created ────────────────────────────────────────────────────

@receiver(post_save, sender=Appointment)
def notify_on_appointment_created(sender, instance, created, **kwargs):
    if not created:
        return
    send_html_email(
        subject='Appointment request submitted',
        template_name='appointment_booked_patient',
        context={'appointment': instance},
        to=[instance.patient.user.email],
    )
    send_html_email(
        subject='New appointment request',
        template_name='appointment_booked_doctor',
        context={'appointment': instance},
        to=[instance.doctor.user.email],
    )


# ── 4. Appointment status changed ────────────────────────────────────────────

@receiver(pre_save, sender=Appointment)
def cache_previous_appointment_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_status = Appointment.objects.get(pk=instance.pk).status
        except Appointment.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Appointment)
def notify_on_status_change(sender, instance, created, **kwargs):
    if created:
        return
    previous = getattr(instance, '_previous_status', None)
    if previous and previous != instance.status:
        send_html_email(
            subject=f'Your appointment is now {instance.status}',
            template_name='appointment_status_changed',
            context={'appointment': instance, 'previous_status': previous},
            to=[instance.patient.user.email],
        )
