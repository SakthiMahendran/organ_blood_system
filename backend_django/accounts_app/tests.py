from rest_framework import status
from rest_framework.test import APITestCase

class AuthApiTests(APITestCase):
    def test_register_and_login(self):
        payload = {
            "username": "acceptor1",
            "email": "acceptor1@example.com",
            "password": "StrongPass123",
            "user_type": "ACCEPTOR",
            "city": "Chennai",
            "state": "TN",
        }
        register_response = self.client.post("/api/auth/register", payload, format="json")
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(register_response.data["success"])

        login_response = self.client.post(
            "/api/auth/login",
            {"identifier": "acceptor1", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data["data"]["tokens"])

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
