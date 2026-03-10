from django.urls import path

from accounts_app import views as account_views
from hospitals import views as hospital_views

from . import views

urlpatterns = [
    path("audit", views.audit_list, name="admin-audit"),
    path("reports/summary", views.summary_report, name="admin-summary"),
    path("reports/analytics", views.analytics_report, name="admin-analytics"),
    path("inventory", views.inventory_list, name="admin-inventory"),
    path("inventory/<str:blood_group>", views.inventory_update, name="admin-inventory-update"),
    path("users", account_views.admin_users, name="admin-users"),
    path("users/<int:user_id>", account_views.admin_update_user, name="admin-user-update"),
    path("hospitals", hospital_views.admin_hospitals, name="admin-hospitals"),
    path("hospitals/<int:hospital_id>", hospital_views.admin_update_hospital, name="admin-hospital-update"),
]
