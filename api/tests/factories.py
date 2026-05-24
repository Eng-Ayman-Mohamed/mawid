import factory
from django.contrib.auth import get_user_model
from factory.django import DjangoModelFactory

from doctors.models import Doctor, DoctorAvailability, Specialty
from patients.models import Patient
from appointments.models import Appointment

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email      = factory.Sequence(lambda n: f'user{n}@test.com')
    password   = factory.PostGenerationMethodCall('set_password', 'Test1234!')
    role       = 'patient'
    is_approved = True
    is_blocked  = False
    is_active   = True


class SpecialtyFactory(DjangoModelFactory):
    class Meta:
        model = Specialty

    name = factory.Sequence(lambda n: f'Specialty {n}')


class DoctorFactory(DjangoModelFactory):
    class Meta:
        model = Doctor

    user           = factory.SubFactory(UserFactory, role='doctor', is_approved=True)
    specialty      = factory.SubFactory(SpecialtyFactory)
    license_number = factory.Sequence(lambda n: f'LIC-{n:05d}')
    bio            = 'Experienced physician.'


class PatientFactory(DjangoModelFactory):
    class Meta:
        model = Patient

    user  = factory.SubFactory(UserFactory, role='patient', is_approved=True)
    phone = factory.Faker('phone_number')


class AvailabilityFactory(DjangoModelFactory):
    class Meta:
        model = DoctorAvailability

    doctor     = factory.SubFactory(DoctorFactory)
    weekday    = 0
    start_time = '09:00'
    end_time   = '17:00'


class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment

    doctor    = factory.SubFactory(DoctorFactory)
    patient   = factory.SubFactory(PatientFactory)
    date      = factory.Faker('future_date', end_date='+30d')
    time_slot = '10:00'
    reason    = 'Routine check'
    status    = 'pending'
