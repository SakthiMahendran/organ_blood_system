from django.urls import path

from . import views

urlpatterns = [
    path("my", views.my_donations, name="my-donations"),
    path("<int:donation_id>", views.donation_detail, name="donation-detail"),
    path("all", views.all_donations, name="all-donations"),
    path("<int:donation_id>/status", views.admin_update_donation, name="admin-donation-update"),
]
