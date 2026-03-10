from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_DONOR = "DONOR"
    ROLE_ACCEPTOR = "ACCEPTOR"
    ROLE_HOSPITAL = "HOSPITAL"
    ROLE_ADMIN = "ADMIN"

    USER_TYPE_CHOICES = (
        (ROLE_DONOR, "Donor"),
        (ROLE_ACCEPTOR, "Acceptor"),
        (ROLE_HOSPITAL, "Hospital"),
        (ROLE_ADMIN, "Admin"),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default=ROLE_DONOR)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=80, blank=True, null=True)
    state = models.CharField(max_length=80, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["user_type"]),
        ]

    def __str__(self):
        return self.email or self.username
