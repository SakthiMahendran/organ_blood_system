"""
Management command: seed_demo
Creates demo accounts for the deployed instance.
Skips silently if data already exists (idempotent).
"""

from django.core.management.base import BaseCommand
from django.db import transaction


DEMO_PASSWORD = "Demo1234!"


class Command(BaseCommand):
    help = "Seed demo users and data for the deployed instance (idempotent)"

    def handle(self, *args, **options):
        from accounts_app.models import User

        if User.objects.filter(email="admin@demo.com").exists():
            self.stdout.write("Demo data already present — skipping.")
            return

        self.stdout.write("Seeding demo data...")

        with transaction.atomic():
            self._create_users()

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write("  admin@demo.com  / Demo1234!  (Admin)")
        self.stdout.write("  donor@demo.com  / Demo1234!  (Donor)")
        self.stdout.write("  hospital@demo.com / Demo1234! (Hospital)")
        self.stdout.write("  acceptor@demo.com / Demo1234! (Acceptor)")

    def _create_users(self):
        from accounts_app.models import User
        from donors.models import DonorProfile
        from hospitals.models import Hospital, HospitalStaffUser

        # ── Admin ────────────────────────────────────────────
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@demo.com",
            password=DEMO_PASSWORD,
            first_name="Admin",
            last_name="Demo",
            user_type=User.ROLE_ADMIN,
        )

        # ── Hospital entity ───────────────────────────────────
        hospital = Hospital.objects.create(
            name="City General Hospital",
            license_id="HOSP-DEMO-001",
            institution_type="Government",
            email="hospital@demo.com",
            phone="9876543210",
            address="123 Medical Lane",
            city="Chennai",
            state="Tamil Nadu",
            blood_bank_available=True,
            organ_transplant_support=True,
            emergency_response=True,
            supported_blood_groups=["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            approval_status=Hospital.APPROVED,
        )

        # ── Hospital user ─────────────────────────────────────
        hospital_user = User.objects.create_user(
            username="hospital1",
            email="hospital@demo.com",
            password=DEMO_PASSWORD,
            first_name="Hospital",
            last_name="Staff",
            user_type=User.ROLE_HOSPITAL,
        )
        HospitalStaffUser.objects.create(hospital=hospital, user=hospital_user)

        # ── Donor user ────────────────────────────────────────
        donor_user = User.objects.create_user(
            username="donor1",
            email="donor@demo.com",
            password=DEMO_PASSWORD,
            first_name="Ramesh",
            last_name="Kumar",
            user_type=User.ROLE_DONOR,
        )
        DonorProfile.objects.create(
            user=donor_user,
            blood_group="O+",
            organ_willing=True,
            organ_types=["kidney", "liver"],
            availability_status=DonorProfile.AVAILABLE,
            verification_status=DonorProfile.VERIFIED,
            city="Chennai",
            state="Tamil Nadu",
        )

        # ── Acceptor user ─────────────────────────────────────
        User.objects.create_user(
            username="acceptor1",
            email="acceptor@demo.com",
            password=DEMO_PASSWORD,
            first_name="Priya",
            last_name="Sharma",
            user_type=User.ROLE_ACCEPTOR,
        )

        return admin, hospital_user, donor_user
