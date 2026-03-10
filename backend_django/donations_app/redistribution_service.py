from collections import defaultdict
from datetime import date, timedelta

from django.db.models import Count, Q
from django.utils import timezone

from requests_app.models import Request

from .models import BloodUnit, RedistributionSuggestion


def generate_suggestions():
    """
    Finds hospitals with near-expiry surplus and matches against
    unfulfilled requests at other hospitals.
    """
    today = date.today()
    expiry_threshold = today + timedelta(days=7)

    # Find near-expiry surplus by hospital + blood group
    surplus = (
        BloodUnit.objects.filter(
            status=BloodUnit.AVAILABLE,
            expiry_date__gte=today,
            expiry_date__lte=expiry_threshold,
        )
        .values("hospital_name", "blood_group")
        .annotate(count=Count("id"))
        .filter(count__gte=2)
    )

    # Find unfulfilled requests
    active_statuses = {Request.SUBMITTED, Request.MATCHING, Request.MATCHED}
    unfulfilled = Request.objects.filter(
        request_type=Request.BLOOD,
        status__in=active_statuses,
    ).values("blood_group", "city", "hospital__name", "units_needed")

    # Build demand map: blood_group -> list of {hospital, units}
    demand_map = defaultdict(list)
    for req in unfulfilled:
        hospital = req.get("hospital__name") or req.get("city", "Unknown")
        demand_map[req["blood_group"]].append({
            "hospital": hospital,
            "units_needed": req["units_needed"] or 1,
        })

    suggestions = []
    for entry in surplus:
        source = entry["hospital_name"]
        bg = entry["blood_group"]
        available = entry["count"]

        for demand in demand_map.get(bg, []):
            if demand["hospital"] == source:
                continue

            suggest_units = min(available, demand["units_needed"])
            if suggest_units <= 0:
                continue

            # Skip if identical suggestion already exists
            exists = RedistributionSuggestion.objects.filter(
                source_hospital=source,
                target_hospital=demand["hospital"],
                blood_group=bg,
                status=RedistributionSuggestion.PENDING,
            ).exists()
            if exists:
                continue

            suggestion = RedistributionSuggestion.objects.create(
                source_hospital=source,
                target_hospital=demand["hospital"],
                blood_group=bg,
                suggested_units=suggest_units,
                reason=f"{available} units of {bg} at {source} expire within 7 days. "
                       f"{demand['hospital']} has an active request for {bg}.",
            )
            suggestions.append(suggestion)

    return suggestions


def approve_suggestion(suggestion_id, admin_user):
    suggestion = RedistributionSuggestion.objects.get(id=suggestion_id)
    suggestion.status = RedistributionSuggestion.APPROVED
    suggestion.reviewed_at = timezone.now()
    suggestion.reviewed_by = admin_user
    suggestion.save()
    return suggestion


def reject_suggestion(suggestion_id, admin_user):
    suggestion = RedistributionSuggestion.objects.get(id=suggestion_id)
    suggestion.status = RedistributionSuggestion.REJECTED
    suggestion.reviewed_at = timezone.now()
    suggestion.reviewed_by = admin_user
    suggestion.save()
    return suggestion
