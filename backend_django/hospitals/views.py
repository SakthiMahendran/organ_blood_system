from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from accounts_app.permissions import IsAdminUserType, IsHospital
from audit_app.services import audit_log
from donors.models import DonorProfile
from notifications_app.models import Notification
from notifications_app.services import create_notification
from requests_app.models import Request
from requests_app.serializers import RequestSerializer

from .models import Hospital
from .serializers import HospitalSerializer
from .services import get_hospital_for_user


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHospital])
def hospital_requests(request):
    hospital = get_hospital_for_user(request.user)
    if not hospital:
        return Response({"success": True, "data": []})

    # Show requests already assigned to this hospital, plus incoming unassigned requests.
    qs = Request.objects.filter(
        Q(hospital=hospital) | Q(hospital__isnull=True)
    ).order_by("-created_at")
    return Response({"success": True, "data": RequestSerializer(qs[:300], many=True).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsHospital])
def pending_verifications(request):
    qs = DonorProfile.objects.select_related("user").filter(verification_status=DonorProfile.PENDING).order_by("-updated_at")
    data = [
        {
            "id": p.id,
            "user_id": p.user_id,
            "donor_name": p.user.username,
            "blood_group": p.blood_group,
            "organ_willing": p.organ_willing,
            "city": p.city,
            "verification_status": p.verification_status,
        }
        for p in qs[:300]
    ]
    return Response({"success": True, "data": data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsHospital])
def update_verification(request, donor_id):
    profile = DonorProfile.objects.select_related("user").filter(id=donor_id).first()
    if not profile:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Donor profile not found"}}, status=404)

    status_value = request.data.get("verification_status")
    if status_value not in {DonorProfile.VERIFIED, DonorProfile.REJECTED}:
        return Response({"success": False, "error": {"code": "BAD_REQUEST", "message": "verification_status must be VERIFIED or REJECTED"}}, status=400)

    profile.verification_status = status_value
    profile.save(update_fields=["verification_status", "updated_at"])

    create_notification(
        user=profile.user,
        title="Verification status updated",
        message=f"Your donor verification status is now {status_value}.",
        notification_type=Notification.TYPE_VERIFY_STATUS,
    )
    audit_log(
        actor=request.user,
        action="DONOR_VERIFICATION_UPDATED",
        entity_type="DonorProfile",
        entity_id=profile.id,
        metadata={"verification_status": status_value},
    )

    return Response({"success": True, "data": {"id": profile.id, "verification_status": profile.verification_status}})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsHospital])
def update_request_status(request, request_id):
    hospital = get_hospital_for_user(request.user)
    if not hospital:
        return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Hospital mapping not found"}}, status=403)

    obj = Request.objects.filter(id=request_id).first()
    if not obj:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Request not found"}}, status=404)

    # Prevent one hospital from changing requests already owned by another hospital.
    if obj.hospital_id and obj.hospital_id != hospital.id:
        return Response(
            {"success": False, "error": {"code": "FORBIDDEN", "message": "Request belongs to another hospital"}},
            status=403,
        )

    allowed = {Request.APPROVED, Request.FULFILLED}
    new_status = request.data.get("status")
    if new_status not in allowed:
        return Response({"success": False, "error": {"code": "BAD_REQUEST", "message": "status must be APPROVED or FULFILLED"}}, status=400)

    # Claim unassigned request when hospital starts processing it.
    if not obj.hospital_id:
        obj.hospital = hospital
    obj.status = new_status
    if "notes" in request.data:
        obj.notes = request.data.get("notes")
    obj.save(update_fields=["hospital", "status", "notes", "updated_at"])

    # Auto-run matching when hospital approves a request so donors receive matches.
    if new_status == Request.APPROVED:
        from matching.services import run_matching
        run_matching(obj)

    create_notification(
        user=obj.created_by,
        title="Request status updated",
        message=f"Request #{obj.id} status changed to {obj.status}.",
        notification_type=Notification.TYPE_REQUEST_UPDATE,
    )
    audit_log(
        actor=request.user,
        action="REQUEST_STATUS_UPDATED_BY_HOSPITAL",
        entity_type="Request",
        entity_id=obj.id,
        metadata={"status": obj.status},
    )

    return Response({"success": True, "data": RequestSerializer(obj).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_hospitals(request):
    qs = Hospital.objects.order_by("-created_at")
    return Response({"success": True, "data": HospitalSerializer(qs, many=True).data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_update_hospital(request, hospital_id):
    hospital = Hospital.objects.filter(id=hospital_id).first()
    if not hospital:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Hospital not found"}}, status=status.HTTP_404_NOT_FOUND)

    approval_status = request.data.get("approval_status")
    if approval_status not in {Hospital.PENDING, Hospital.APPROVED, Hospital.SUSPENDED}:
        return Response({"success": False, "error": {"code": "BAD_REQUEST", "message": "Invalid approval_status"}}, status=status.HTTP_400_BAD_REQUEST)

    hospital.approval_status = approval_status
    hospital.save(update_fields=["approval_status"])
    audit_log(
        actor=request.user,
        action="HOSPITAL_STATUS_UPDATED",
        entity_type="Hospital",
        entity_id=hospital.id,
        metadata={"approval_status": approval_status},
    )
    return Response({"success": True, "data": HospitalSerializer(hospital).data})
