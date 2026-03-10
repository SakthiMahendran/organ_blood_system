from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor_user.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = ("id", "actor_user", "actor_email", "action", "entity_type", "entity_id", "metadata", "created_at")
