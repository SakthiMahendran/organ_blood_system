from django.core.management.base import BaseCommand

from donations_app.inventory_services import mark_expired_units


class Command(BaseCommand):
    help = "Mark available blood units past their expiry date as expired."

    def handle(self, *args, **options):
        count = mark_expired_units()
        self.stdout.write(self.style.SUCCESS(f"Marked {count} unit(s) as expired."))
