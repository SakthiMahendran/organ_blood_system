from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts_app.permissions import IsDonor, IsAdminUserType
from audit_app.services import audit_log
from .models import Donation
from .serializers import DonationSerializer


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
