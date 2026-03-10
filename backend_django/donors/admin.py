from django.contrib import admin

from .models import DonorProfile


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "blood_group", "availability_status", "verification_status", "city", "state")
    list_filter = ("availability_status", "verification_status", "blood_group", "state")
    search_fields = ("user__username", "user__email", "city", "state")
