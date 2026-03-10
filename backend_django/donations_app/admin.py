from django.contrib import admin
from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("id", "donor", "donation_type", "status", "created_at")
    list_filter = ("donation_type", "status")
    search_fields = ("donor__username", "hospital_name", "location")
