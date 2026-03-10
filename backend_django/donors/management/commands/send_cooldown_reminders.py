from datetime import date

from django.core.management.base import BaseCommand

from donors.models import DonorProfile
from notifications_app.models import Notification
from notifications_app.services import create_notification


class Command(BaseCommand):
    help = "Send reminders to donors whose cooldown period just ended."

    def handle(self, *args, **options):
        today = date.today()
        sent = 0

        profiles = DonorProfile.objects.select_related("user").filter(
            last_blood_donation_date__isnull=False,
            availability_status=DonorProfile.AVAILABLE,
        )

        for profile in profiles:
            eligible_date = profile.next_eligible_date
            if eligible_date and eligible_date == today:
                create_notification(
                    user=profile.user,
                    title="You're eligible to donate again!",
                    message=(
                        f"Your cooldown period is over. Your blood type {profile.blood_group} "
                        f"may be in demand. Consider donating today!"
                    ),
                    notification_type=Notification.TYPE_COOLDOWN_REMINDER,
                )
                sent += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {sent} cooldown reminder(s)."))
