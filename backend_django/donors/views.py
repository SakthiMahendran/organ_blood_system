from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts_app.permissions import IsDonor
from audit_app.services import audit_log
from notifications_app.models import Notification
from notifications_app.services import create_notification
from requests_app.models import Request

from .models import DonorProfile
from .serializers import DonorProfileSerializer


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated, IsDonor])
def donor_profile(request):
    profile = DonorProfile.objects.filter(user=request.user).first()

    if request.method == "GET":
        if not profile:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Donor profile not found"}}, status=404)
        return Response({"success": True, "data": DonorProfileSerializer(profile).data})

    serializer = DonorProfileSerializer(profile, data=request.data, partial=bool(profile))
    if not serializer.is_valid():
        return Response({"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}}, status=400)

    profile = serializer.save(user=request.user)
    audit_log(
        actor=request.user,
        action="DONOR_PROFILE_UPSERT",
        entity_type="DonorProfile",
        entity_id=profile.id,
    )
    return Response({"success": True, "data": DonorProfileSerializer(profile).data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsDonor])
def donor_availability(request):
    profile = DonorProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Donor profile not found"}}, status=404)

    status_value = request.data.get("availability_status")
    if status_value not in {DonorProfile.AVAILABLE, DonorProfile.NOT_AVAILABLE}:
        return Response(
            {
                "success": False,
                "error": {"code": "BAD_REQUEST", "message": "availability_status must be AVAILABLE or NOT_AVAILABLE"},
            },
            status=400,
        )

    profile.availability_status = status_value
    profile.save(update_fields=["availability_status", "updated_at"])
    audit_log(
        actor=request.user,
        action="DONOR_AVAILABILITY_UPDATED",
        entity_type="DonorProfile",
        entity_id=profile.id,
        metadata={"availability_status": status_value},
    )
    return Response({"success": True, "data": DonorProfileSerializer(profile).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDonor])
def donor_matches(request):
    from matching.models import Match
    from matching.serializers import MatchSerializer

    matches = Match.objects.select_related("request").filter(donor_user=request.user).order_by("-created_at")
    return Response({"success": True, "data": MatchSerializer(matches[:300], many=True).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsDonor])
def respond_to_match(request, match_id):
    from matching.models import Match
    from matching.serializers import MatchSerializer

    match = Match.objects.select_related("request").filter(id=match_id, donor_user=request.user).first()
    if not match:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Match not found"}}, status=404)

    response_value = request.data.get("response")
    if response_value not in {Match.ACCEPTED, Match.DECLINED}:
        return Response(
            {
                "success": False,
                "error": {"code": "BAD_REQUEST", "message": "response must be ACCEPTED or DECLINED"},
            },
            status=400,
        )

    match.donor_response = response_value
    match.save(update_fields=["donor_response"])

    req = match.request
    if response_value == Match.ACCEPTED and req.status == Request.MATCHING:
        req.status = Request.MATCHED
        req.save(update_fields=["status", "updated_at"])

    create_notification(
        user=req.created_by,
        title="Donor responded to match",
        message=f"Donor response for request #{req.id}: {response_value}.",
        notification_type=Notification.TYPE_MATCH_ALERT,
    )
    audit_log(
        actor=request.user,
        action="MATCH_RESPONSE_SUBMITTED",
        entity_type="Match",
        entity_id=match.id,
        metadata={"response": response_value},
    )
    return Response({"success": True, "data": MatchSerializer(match).data}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def eligibility_check(request):
    from .eligibility import check_eligibility

    result = check_eligibility(request.data)
    return Response({"success": True, "data": result})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDonor])
def cooldown_status(request):
    profile = DonorProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Donor profile not found"}}, status=404)

    eligible_date = profile.next_eligible_date
    return Response({
        "success": True,
        "data": {
            "last_donation_date": profile.last_blood_donation_date,
            "last_donation_type": profile.last_donation_type,
            "next_eligible_date": eligible_date.isoformat() if eligible_date else None,
            "cooldown_remaining_days": profile.cooldown_remaining_days,
            "is_eligible": profile.is_cooldown_passed,
            "total_donations": profile.total_donations,
            "milestone_badge": profile.milestone_badge,
            "donation_streak": profile.donation_streak,
            "next_milestone": profile.next_milestone,
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDonor])
def donor_milestones(request):
    profile = DonorProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Donor profile not found"}}, status=404)

    from notifications_app.models import Notification
    impact_messages = list(
        Notification.objects.filter(
            user=request.user, type=Notification.TYPE_IMPACT
        ).order_by("-created_at").values("title", "message", "created_at")[:5]
    )

    return Response({
        "success": True,
        "data": {
            "total_donations": profile.total_donations,
            "milestone_badge": profile.milestone_badge,
            "donation_streak": profile.donation_streak,
            "next_milestone": profile.next_milestone,
            "impact_messages": impact_messages,
        },
    })
