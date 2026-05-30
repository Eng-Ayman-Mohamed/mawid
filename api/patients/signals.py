from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import Appointment


@receiver(pre_save, sender=Appointment)
def _cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = Appointment.objects.get(pk=instance.pk).status
        except Appointment.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Appointment)
def _send_appointment_emails(sender, instance, created, **kwargs):
    patient_email = instance.patient.user.email
    doctor_email  = instance.doctor.user.email
    full_name     = instance.doctor.user.get_full_name()
    doctor_name   = f"Dr. {full_name}" if full_name.strip() else f"Dr. {doctor_email}"
    date_str      = instance.appointment_date.strftime('%A, %B %d, %Y')
    time_str      = instance.appointment_time.strftime('%I:%M %p')

    if created:
        send_mail(
            subject='Appointment Request Received — Mawid',
            message=(
                f"Hello,\n\n"
                f"Your appointment request with {doctor_name} on {date_str} at {time_str} "
                f"has been received and is currently pending confirmation.\n\n"
                f"You will be notified once the doctor confirms or cancels your request.\n\n"
                f"— Mawid Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email],
            fail_silently=True,
        )
        send_mail(
            subject='New Appointment Request — Mawid',
            message=(
                f"Hello {doctor_name},\n\n"
                f"You have a new appointment request from {patient_email} "
                f"on {date_str} at {time_str}.\n\n"
                f"Please log in to confirm or reject this request.\n\n"
                f"— Mawid Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[doctor_email],
            fail_silently=True,
        )
    else:
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status and instance.status in ('confirmed', 'cancelled'):
            label = instance.status.capitalize()
            send_mail(
                subject=f'Appointment {label} — Mawid',
                message=(
                    f"Hello,\n\n"
                    f"Your appointment with {doctor_name} on {date_str} at {time_str} "
                    f"has been {instance.status}.\n\n"
                    f"— Mawid Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[patient_email],
                fail_silently=True,
            )
