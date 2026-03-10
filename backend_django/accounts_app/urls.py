from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register", views.register, name="register"),
    path("register/hospital", views.register_hospital, name="register-hospital"),
    path("login", views.login, name="login"),
    path("logout", views.logout, name="logout"),
    path("me", views.me, name="me"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
]
