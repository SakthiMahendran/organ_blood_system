from collections import defaultdict
from datetime import date, timedelta

from django.db.models import Count, Q

from .models import BloodUnit


def get_expiry_alerts():
    """Returns blood units grouped by expiry status (RED/AMBER/GREEN) per blood group."""
    today = date.today()
    red_cutoff = today + timedelta(days=3)
    amber_cutoff = today + timedelta(days=7)

    available_units = BloodUnit.objects.filter(status=BloodUnit.AVAILABLE, expiry_date__gte=today)

    summary = {
        "red": list(available_units.filter(expiry_date__lt=red_cutoff).values(
            "id", "unit_id", "blood_group", "component_type", "collection_date",
            "expiry_date", "hospital_name"
        )),
        "amber": list(available_units.filter(
            expiry_date__gte=red_cutoff, expiry_date__lt=amber_cutoff
        ).values(
            "id", "unit_id", "blood_group", "component_type", "collection_date",
            "expiry_date", "hospital_name"
        )),
        "green_count": available_units.filter(expiry_date__gte=amber_cutoff).count(),
        "red_count": available_units.filter(expiry_date__lt=red_cutoff).count(),
        "amber_count": available_units.filter(
            expiry_date__gte=red_cutoff, expiry_date__lt=amber_cutoff
        ).count(),
    }

    return summary


def get_fifo_suggestion(blood_group, units_needed):
    """Returns oldest-first available units of the given blood group."""
    units = BloodUnit.objects.filter(
        blood_group=blood_group,
        status=BloodUnit.AVAILABLE,
        expiry_date__gte=date.today(),
    ).order_by("collection_date")[:units_needed]

    return list(units.values(
        "id", "unit_id", "blood_group", "component_type",
        "collection_date", "expiry_date", "hospital_name"
    ))


def mark_expired_units():
    """Mark all available units past their expiry date as expired."""
    count = BloodUnit.objects.filter(
        status=BloodUnit.AVAILABLE,
        expiry_date__lt=date.today(),
    ).update(status=BloodUnit.EXPIRED)
    return count


def get_inventory_aggregate():
    """Aggregate available blood unit counts by blood group."""
    return list(
        BloodUnit.objects.filter(status=BloodUnit.AVAILABLE, expiry_date__gte=date.today())
        .values("blood_group")
        .annotate(units=Count("id"))
        .order_by("blood_group")
    )


def get_wastage_stats():
    """Returns expired/discarded counts."""
    expired = BloodUnit.objects.filter(status=BloodUnit.EXPIRED).count()
    discarded = BloodUnit.objects.filter(status=BloodUnit.DISCARDED).count()
    total = BloodUnit.objects.count()
    return {
        "expired": expired,
        "discarded": discarded,
        "total_units": total,
        "wastage_rate": round((expired + discarded) / max(total, 1) * 100, 1),
    }
