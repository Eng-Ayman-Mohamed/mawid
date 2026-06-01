from django.contrib import admin


# Register your models here.

from .models import Doctor, DoctorAvailability, Specialty

admin.site.register(Doctor)
admin.site.register(DoctorAvailability)
admin.site.register(Specialty)

