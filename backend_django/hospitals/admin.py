from django.contrib import admin

from .models import Hospital, HospitalStaffUser


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "license_id", "city", "state", "approval_status", "created_at")
    list_filter = ("approval_status", "state")
    search_fields = ("name", "license_id", "city", "state")


@admin.register(HospitalStaffUser)
class HospitalStaffUserAdmin(admin.ModelAdmin):
    list_display = ("id", "hospital", "user", "created_at")
    search_fields = ("hospital__name", "user__username", "user__email")
