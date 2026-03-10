from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("id", "request", "donor_user", "match_score", "donor_response", "created_at")
    list_filter = ("donor_response",)
    search_fields = ("request__id", "donor_user__username", "donor_user__email")
