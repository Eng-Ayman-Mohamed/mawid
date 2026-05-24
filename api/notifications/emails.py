from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_html_email(subject: str, template_name: str, context: dict, to: list) -> None:
    html_body = render_to_string(f'emails/{template_name}.html', context)
    msg = EmailMultiAlternatives(
        subject=subject,
        body=html_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to,
    )
    msg.attach_alternative(html_body, 'text/html')
    msg.send(fail_silently=False)
