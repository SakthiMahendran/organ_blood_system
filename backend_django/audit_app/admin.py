from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "actor_user", "action", "entity_type", "entity_id", "created_at")
    list_filter = ("action", "entity_type", "created_at")
    search_fields = ("actor_user__username", "actor_user__email", "action", "entity_type")
