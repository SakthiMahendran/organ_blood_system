from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts_app.urls")),
    path("api/donors/", include("donors.urls")),
    path("api/requests/", include("requests_app.urls")),
    path("api/matching/", include("matching.urls")),
    path("api/search/", include("matching.search_urls")),
    path("api/hospital/", include("hospitals.urls")),
    path("api/notifications/", include("notifications_app.urls")),
    path("api/admin/", include("audit_app.urls")),
]
