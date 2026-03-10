from typing import Any

from .models import AuditLog


def audit_log(actor, action: str, entity_type: str, entity_id: int, metadata: dict[str, Any] | None = None):
    return AuditLog.objects.create(
        actor_user=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata=metadata or {},
    )
