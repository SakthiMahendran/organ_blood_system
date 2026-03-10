from django.urls import path

from . import views

urlpatterns = [
    path("my", views.my_donations, name="my-donations"),
    path("<int:donation_id>", views.donation_detail, name="donation-detail"),
    path("all", views.all_donations, name="all-donations"),
    path("<int:donation_id>/status", views.admin_update_donation, name="admin-donation-update"),
    # Blood Unit endpoints
    path("blood-units/", views.blood_units, name="blood-units"),
    path("blood-units/expiry-alerts/", views.blood_unit_expiry_alerts, name="blood-unit-expiry-alerts"),
    path("blood-units/fifo-suggestion/", views.blood_unit_fifo_suggestion, name="blood-unit-fifo"),
    path("blood-units/wastage-stats/", views.blood_unit_wastage_stats, name="blood-unit-wastage"),
    # Redistribution endpoints
    path("redistribution/suggestions/", views.redistribution_suggestions, name="redistribution-suggestions"),
    path("redistribution/generate/", views.generate_redistribution, name="redistribution-generate"),
    path("redistribution/suggestions/<int:suggestion_id>/", views.update_redistribution, name="redistribution-update"),
]
