from django.conf import settings
from django.db import models


class Hospital(models.Model):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    SUSPENDED = "SUSPENDED"

    APPROVAL_CHOICES = (
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (SUSPENDED, "Suspended"),
    )

    name = models.CharField(max_length=180)
    license_id = models.CharField(max_length=80, unique=True)
    institution_type = models.CharField(max_length=60, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255)
    address_line_1 = models.CharField(max_length=255, blank=True, null=True)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    pincode = models.CharField(max_length=12, blank=True, null=True)
    contact_person_name = models.CharField(max_length=120, blank=True, null=True)
    contact_person_role = models.CharField(max_length=120, blank=True, null=True)
    contact_person_phone = models.CharField(max_length=20, blank=True, null=True)
    blood_bank_available = models.BooleanField(default=False)
    organ_transplant_support = models.BooleanField(default=False)
    emergency_response = models.BooleanField(default=False)
    supported_blood_groups = models.JSONField(default=list, blank=True)
    license_document_name = models.CharField(max_length=255, blank=True, null=True)
    hospital_id_proof_name = models.CharField(max_length=255, blank=True, null=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["approval_status"]),
            models.Index(fields=["city", "state"]),
        ]

    def __str__(self):
        return self.name


class HospitalStaffUser(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name="staff_users")
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hospital_staff")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["hospital", "user"])]

    def __str__(self):
        return f"{self.user_id} -> {self.hospital_id}"
