from django.contrib import admin

from .models import Request


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ("id", "created_by", "request_type", "urgency", "city", "state", "status", "created_at")
    list_filter = ("request_type", "urgency", "status", "state")
    search_fields = ("created_by__username", "created_by__email", "city", "state", "blood_group", "organ_type")
