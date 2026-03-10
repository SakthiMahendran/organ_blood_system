from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications_app.models import Notification
from notifications_app.services import create_notification
from requests_app.models import Request


ESCALATION_RULES = [
    # (current_urgencies, hours_threshold, new_urgency)
    ([Request.LOW], 48, Request.HIGH),
    ([Request.MEDIUM], 36, Request.HIGH),
    ([Request.HIGH], 24, Request.CRITICAL),
]

ACTIVE_STATUSES = {Request.SUBMITTED, Request.MATCHING, Request.MATCHED}


class Command(BaseCommand):
    help = "Auto-escalate unfulfilled requests based on time thresholds."

    def handle(self, *args, **options):
        now = timezone.now()
        escalated_count = 0

        for urgencies, hours, new_urgency in ESCALATION_RULES:
            cutoff = now - timedelta(hours=hours)
            requests_to_escalate = Request.objects.filter(
                urgency__in=urgencies,
                status__in=ACTIVE_STATUSES,
                created_at__lte=cutoff,
            )

            for req in requests_to_escalate:
                if not req.original_urgency:
                    req.original_urgency = req.urgency
                req.urgency = new_urgency
                req.escalated_at = now
                req.save()

                create_notification(
                    user=req.created_by,
                    title="Request auto-escalated",
                    message=(
                        f"Request #{req.id} has been auto-escalated from "
                        f"{req.original_urgency} to {new_urgency} due to unfulfillment."
                    ),
                    notification_type=Notification.TYPE_ESCALATION,
                    related_request=req,
                )
                escalated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Escalated {escalated_count} request(s)."))
