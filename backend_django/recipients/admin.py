from django.contrib import admin

from .models import RecipientProfile


@admin.register(RecipientProfile)
class RecipientProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "location", "phone", "hospital_name", "created_at")
    search_fields = ("user__username", "user__email", "location", "hospital_name")
    list_filter = ("created_at",)
