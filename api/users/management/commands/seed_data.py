from datetime import time, date, timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from doctors.models import Doctor, DoctorAvailability, Specialty
from patients.models import Appointment, Patient
from users.models import CustomUser, UserRole

# Hash passwords once at module load — avoids repeated expensive hashing
HASHED_ADMIN_PASSWORD = make_password('admin123')
HASHED_DOCTOR_PASSWORD = make_password('doctor123')
HASHED_PATIENT_PASSWORD = make_password('patient123')


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        if CustomUser.objects.filter(email='admin@mawid.com').exists():
            self.stdout.write(self.style.WARNING('Seed data already exists, skipping.'))
            return

        with transaction.atomic():
            self._create_specialties()
            self._create_admin()

            doctor_cardiologist = self._create_doctor(
                email='dr.sarah@mawid.com',
                first_name='Sarah',
                last_name='Ahmed',
                specialty_name='Cardiology',
                bio='Expert cardiologist with 12 years of experience in interventional cardiology.',
                contact='+201001234567',
                years_of_experience=12,
                availability_slots=[
                    ('MON', '09:00', '13:00'),
                    ('WED', '09:00', '15:00'),
                    ('THU', '10:00', '14:00'),
                ],
            )
            doctor_neurologist = self._create_doctor(
                email='dr.mohamed@mawid.com',
                first_name='Mohamed',
                last_name='Ali',
                specialty_name='Neurology',
                bio='Specialist in neurology and neuromuscular disorders.',
                contact='+201009876543',
                years_of_experience=8,
                availability_slots=[
                    ('TUE', '10:00', '16:00'),
                    ('WED', '12:00', '18:00'),
                    ('FRI', '09:00', '13:00'),
                ],
            )

            patient_omar = self._create_patient(
                email='omar.hassan@mail.com',
                first_name='Omar',
                last_name='Hassan',
                phone='+201005551111',
                date_of_birth=date(1990, 5, 15),
                address='12 Nile Street, Cairo',
                blood_group='A+',
            )
            patient_nour = self._create_patient(
                email='nour.adel@mail.com',
                first_name='Nour',
                last_name='Adel',
                phone='+201005552222',
                date_of_birth=date(1995, 11, 3),
                address='45 Zamalek Avenue, Cairo',
                blood_group='O-',
            )

            today = timezone.now().date()
            self._create_appointments(
                patient_omar, patient_nour,
                doctor_cardiologist, doctor_neurologist,
                today,
            )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _create_specialties(self):
        existing = set(Specialty.objects.values_list('name', flat=True))
        specialties_data = [
            ('Cardiology',   'Diagnosis and treatment of heart disorders'),
            ('Neurology',    'Diagnosis and treatment of nervous system disorders'),
            ('Dermatology',  'Diagnosis and treatment of skin conditions'),
            ('Pediatrics',   'Medical care for infants, children, and adolescents'),
            ('Orthopedics',  'Treatment of musculoskeletal system conditions'),
        ]
        new_specialties = [
            Specialty(name=name, description=desc)
            for name, desc in specialties_data
            if name not in existing
        ]
        if new_specialties:
            Specialty.objects.bulk_create(new_specialties)

    def _create_admin(self):
        user, created = CustomUser.objects.get_or_create(
            email='admin@mawid.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': UserRole.ADMIN,
                'is_approved': True,
                'is_staff': True,
                'is_superuser': True,
                'password': HASHED_ADMIN_PASSWORD,  # pre-hashed — no extra save()
            },
        )

    def _create_doctor(
        self, email, first_name, last_name, specialty_name,
        bio, contact, years_of_experience, availability_slots,
    ):
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': UserRole.DOCTOR,
                'is_approved': True,
                'password': HASHED_DOCTOR_PASSWORD,  # pre-hashed — no extra save()
            },
        )

        specialty = Specialty.objects.get(name=specialty_name)
        doctor, _ = Doctor.objects.get_or_create(
            user=user,
            defaults={
                'specialty': specialty,
                'bio': bio,
                'contact': contact,
                'years_of_experience': years_of_experience,
            },
        )

        # Bulk-create availability slots, skipping duplicates
        existing_days = set(
            DoctorAvailability.objects.filter(doctor=doctor).values_list('day', flat=True)
        )
        new_slots = [
            DoctorAvailability(doctor=doctor, day=day, start_time=start, end_time=end)
            for day, start, end in availability_slots
            if day not in existing_days
        ]
        if new_slots:
            DoctorAvailability.objects.bulk_create(new_slots)

        return doctor

    def _create_patient(self, email, first_name, last_name, phone, date_of_birth, address, blood_group):
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': UserRole.PATIENT,
                'is_approved': True,
                'password': HASHED_PATIENT_PASSWORD,  # pre-hashed — no extra save()
            },
        )

        patient, _ = Patient.objects.get_or_create(
            user=user,
            defaults={
                'phone': phone,
                'date_of_birth': date_of_birth,
                'address': address,
                'blood_group': blood_group,
            },
        )
        return patient

    def _create_appointments(self, patient_omar, patient_nour, doctor_cardiologist, doctor_neurologist, today):
        """Bulk-create all appointments in a single query."""
        appointments_data = [
            (patient_omar, doctor_cardiologist, today + timedelta(days=1),  time(10, 0),  'confirmed'),
            (patient_nour, doctor_neurologist,  today + timedelta(days=2),  time(14, 30), 'confirmed'),
            (patient_omar, doctor_neurologist,  today + timedelta(days=5),  time(11, 0),  'pending'),
            (patient_nour, doctor_cardiologist, today - timedelta(days=3),  time(9, 30),  'completed'),
            (patient_omar, doctor_cardiologist, today - timedelta(days=10), time(15, 0),  'completed'),
            (patient_nour, doctor_neurologist,  today - timedelta(days=1),  time(12, 0),  'cancelled'),
        ]

        # Avoid duplicates by checking existing (patient, doctor, date, time) combos
        existing = set(
            Appointment.objects.values_list(
                'patient_id', 'doctor_id', 'appointment_date', 'appointment_time'
            )
        )

        new_appointments = [
            Appointment(
                patient=patient,
                doctor=doctor,
                appointment_date=appt_date,
                appointment_time=appt_time,
                status=status,
            )
            for patient, doctor, appt_date, appt_time, status in appointments_data
            if (patient.pk, doctor.pk, appt_date, appt_time) not in existing
        ]

        if new_appointments:
            Appointment.objects.bulk_create(new_appointments)