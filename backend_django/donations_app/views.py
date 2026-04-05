from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts_app.permissions import IsDonor, IsAdminUserType
from audit_app.services import audit_log
from .models import BloodUnit, Donation, OrganUnit, RedistributionSuggestion
from .serializers import BloodUnitSerializer, DonationSerializer, OrganUnitSerializer, RedistributionSuggestionSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsDonor])
def my_donations(request):
    """List donor's own donations or create a new one."""
    if request.method == "GET":
        donations = Donation.objects.filter(donor=request.user).order_by("-created_at")
        return Response({"success": True, "data": DonationSerializer(donations, many=True).data})

    serializer = DonationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    donation = serializer.save(donor=request.user)
    audit_log(
        actor=request.user,
        action="DONATION_CREATED",
        entity_type="Donation",
        entity_id=donation.id,
        metadata={"donation_type": donation.donation_type},
    )
    return Response({"success": True, "data": DonationSerializer(donation).data}, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsDonor])
def donation_detail(request, donation_id):
    """Get, update, or delete a specific donation."""
    donation = Donation.objects.filter(id=donation_id, donor=request.user).first()
    if not donation:
        return Response(
            {"success": False, "error": {"code": "NOT_FOUND", "message": "Donation not found"}},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        return Response({"success": True, "data": DonationSerializer(donation).data})

    if request.method == "DELETE":
        if donation.status not in ("pending",):
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "Only pending donations can be deleted"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        donation_id_val = donation.id
        donation.delete()
        audit_log(
            actor=request.user,
            action="DONATION_DELETED",
            entity_type="Donation",
            entity_id=donation_id_val,
        )
        return Response({"success": True, "data": {"message": "Donation deleted"}})

    serializer = DonationSerializer(donation, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    donation = serializer.save()
    audit_log(
        actor=request.user,
        action="DONATION_UPDATED",
        entity_type="Donation",
        entity_id=donation.id,
    )
    return Response({"success": True, "data": DonationSerializer(donation).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def all_donations(request):
    """Admin: list all donations with optional filters."""
    qs = Donation.objects.select_related("donor").order_by("-created_at")

    donation_type = request.query_params.get("donation_type")
    if donation_type:
        qs = qs.filter(donation_type=donation_type)

    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)

    blood_group = request.query_params.get("blood_group")
    if blood_group:
        qs = qs.filter(blood_group=blood_group)

    return Response({"success": True, "data": DonationSerializer(qs[:500], many=True).data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_update_donation(request, donation_id):
    """Admin: update donation status."""
    donation = Donation.objects.filter(id=donation_id).first()
    if not donation:
        return Response(
            {"success": False, "error": {"code": "NOT_FOUND", "message": "Donation not found"}},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get("status")
    valid_statuses = [s[0] for s in Donation.STATUS_CHOICES]
    if new_status and new_status not in valid_statuses:
        return Response(
            {"success": False, "error": {"code": "BAD_REQUEST", "message": f"Status must be one of: {', '.join(valid_statuses)}"}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = DonationSerializer(donation, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    donation = serializer.save()
    audit_log(
        actor=request.user,
        action="ADMIN_DONATION_STATUS_UPDATED",
        entity_type="Donation",
        entity_id=donation.id,
        metadata={"status": donation.status},
    )
    return Response({"success": True, "data": DonationSerializer(donation).data})


# ---------- Blood Unit Endpoints ----------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def blood_units(request):
    """List or register blood units. Admin/Hospital only for POST."""
    if request.method == "GET":
        qs = BloodUnit.objects.all().order_by("expiry_date")

        blood_group = request.query_params.get("blood_group")
        if blood_group:
            qs = qs.filter(blood_group=blood_group)

        unit_status = request.query_params.get("status")
        if unit_status:
            qs = qs.filter(status=unit_status)

        hospital = request.query_params.get("hospital")
        if hospital:
            qs = qs.filter(hospital_name__icontains=hospital)

        return Response({"success": True, "data": BloodUnitSerializer(qs[:500], many=True).data})

    role = getattr(request.user, "user_type", "")
    if role not in {"ADMIN", "HOSPITAL"}:
        return Response(
            {"success": False, "error": {"code": "FORBIDDEN", "message": "Only admin/hospital can register blood units"}},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = BloodUnitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    unit = serializer.save()
    audit_log(
        actor=request.user,
        action="BLOOD_UNIT_REGISTERED",
        entity_type="BloodUnit",
        entity_id=unit.id,
    )
    return Response({"success": True, "data": BloodUnitSerializer(unit).data}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blood_unit_expiry_alerts(request):
    """Get expiry dashboard data."""
    from .inventory_services import get_expiry_alerts
    data = get_expiry_alerts()
    return Response({"success": True, "data": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blood_unit_fifo_suggestion(request):
    """Get FIFO allocation suggestion for a blood group."""
    blood_group = request.query_params.get("blood_group")
    units_needed = int(request.query_params.get("units", 1))
    if not blood_group:
        return Response(
            {"success": False, "error": {"code": "BAD_REQUEST", "message": "blood_group is required"}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    from .inventory_services import get_fifo_suggestion
    data = get_fifo_suggestion(blood_group, units_needed)
    return Response({"success": True, "data": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blood_unit_wastage_stats(request):
    """Get wastage statistics."""
    from .inventory_services import get_wastage_stats
    data = get_wastage_stats()
    return Response({"success": True, "data": data})


# ---------- Organ Unit Endpoints ----------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def organ_units(request):
    """List or register organ units. Admin/Hospital only for POST."""
    if request.method == "GET":
        qs = OrganUnit.objects.all().order_by("expiry_datetime")

        organ_type = request.query_params.get("organ_type")
        if organ_type:
            qs = qs.filter(organ_type=organ_type)

        unit_status = request.query_params.get("status")
        if unit_status:
            qs = qs.filter(status=unit_status)

        hospital = request.query_params.get("hospital")
        if hospital:
            qs = qs.filter(hospital_name__icontains=hospital)

        return Response({"success": True, "data": OrganUnitSerializer(qs[:500], many=True).data})

    role = getattr(request.user, "user_type", "")
    if role not in {"ADMIN", "HOSPITAL"}:
        return Response(
            {"success": False, "error": {"code": "FORBIDDEN", "message": "Only admin/hospital can register organ units"}},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = OrganUnitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    unit = serializer.save()
    audit_log(
        actor=request.user,
        action="ORGAN_UNIT_REGISTERED",
        entity_type="OrganUnit",
        entity_id=unit.id,
        metadata={"organ_type": unit.organ_type},
    )
    return Response({"success": True, "data": OrganUnitSerializer(unit).data}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def organ_unit_summary(request):
    """Get organ inventory summary grouped by organ type and status."""
    from django.utils import timezone
    from django.db.models import Count
    now = timezone.now()

    # Mark expired units on-the-fly
    OrganUnit.objects.filter(expiry_datetime__lt=now, status=OrganUnit.AVAILABLE).update(status=OrganUnit.EXPIRED)

    summary = {}
    for choice_val, choice_label in OrganUnit.ORGAN_CHOICES:
        qs = OrganUnit.objects.filter(organ_type=choice_val)
        available = qs.filter(status=OrganUnit.AVAILABLE).count()
        critical = qs.filter(
            status=OrganUnit.AVAILABLE,
            expiry_datetime__lte=now + __import__('datetime').timedelta(hours=6),
        ).count()
        summary[choice_val] = {
            "organ_type": choice_val,
            "organ_label": choice_label,
            "available": available,
            "reserved": qs.filter(status=OrganUnit.RESERVED).count(),
            "transplanted": qs.filter(status=OrganUnit.TRANSPLANTED).count(),
            "expired": qs.filter(status=OrganUnit.EXPIRED).count(),
            "critical_expiry": critical,
        }

    return Response({"success": True, "data": list(summary.values())})


# ---------- Redistribution Endpoints ----------

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def redistribution_suggestions(request):
    """List all redistribution suggestions."""
    qs = RedistributionSuggestion.objects.all().order_by("-created_at")
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)
    return Response({"success": True, "data": RedistributionSuggestionSerializer(qs[:200], many=True).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def generate_redistribution(request):
    """Trigger redistribution suggestion generation."""
    from .redistribution_service import generate_suggestions
    suggestions = generate_suggestions()
    return Response({
        "success": True,
        "data": {
            "generated": len(suggestions),
            "suggestions": RedistributionSuggestionSerializer(suggestions, many=True).data,
        },
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def update_redistribution(request, suggestion_id):
    """Approve or reject a redistribution suggestion."""
    suggestion = RedistributionSuggestion.objects.filter(id=suggestion_id).first()
    if not suggestion:
        return Response(
            {"success": False, "error": {"code": "NOT_FOUND", "message": "Suggestion not found"}},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get("status")
    if new_status == "approved":
        from .redistribution_service import approve_suggestion
        suggestion = approve_suggestion(suggestion_id, request.user)
    elif new_status == "rejected":
        from .redistribution_service import reject_suggestion
        suggestion = reject_suggestion(suggestion_id, request.user)
    else:
        return Response(
            {"success": False, "error": {"code": "BAD_REQUEST", "message": "status must be 'approved' or 'rejected'"}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"success": True, "data": RedistributionSuggestionSerializer(suggestion).data})
