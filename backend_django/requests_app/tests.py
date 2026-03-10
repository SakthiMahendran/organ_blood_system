from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Request


class RequestApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="acceptor2",
            email="acceptor2@example.com",
            password="StrongPass123",
            user_type="ACCEPTOR",
        )
        access = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_create_blood_request(self):
        payload = {
            "blood_group": "O+",
            "units_needed": 2,
            "required_date": "2026-03-01",
            "urgency": "HIGH",
            "city": "Chennai",
            "state": "TN",
            "notes": "Emergency need",
        }
        response = self.client.post("/api/requests/blood", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(Request.objects.count(), 1)
        self.assertEqual(Request.objects.first().request_type, Request.BLOOD)
