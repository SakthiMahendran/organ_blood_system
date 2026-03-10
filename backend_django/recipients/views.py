from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts_app.permissions import IsRecipient
from audit_app.services import audit_log
from .models import RecipientProfile
from .serializers import RecipientProfileSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsRecipient])
def my_recipient_profile(request):
    if request.method == "GET":
        profile = RecipientProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Recipient profile not created yet."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"success": True, "data": RecipientProfileSerializer(profile).data})

    serializer = RecipientProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    profile = serializer.save(user=request.user)
    audit_log(
        actor=request.user,
        action="RECIPIENT_PROFILE_CREATED",
        entity_type="RecipientProfile",
        entity_id=profile.id,
    )
    return Response({"success": True, "data": RecipientProfileSerializer(profile).data}, status=status.HTTP_201_CREATED)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated, IsRecipient])
def update_my_recipient_profile(request):
    profile = RecipientProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response(
            {"success": False, "error": {"code": "NOT_FOUND", "message": "Create profile first."}},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = RecipientProfileSerializer(profile, data=request.data, partial=(request.method == "PATCH"))
    if not serializer.is_valid():
        return Response(
            {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Validation failed", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    profile = serializer.save()
    audit_log(
        actor=request.user,
        action="RECIPIENT_PROFILE_UPDATED",
        entity_type="RecipientProfile",
        entity_id=profile.id,
    )
    return Response({"success": True, "data": RecipientProfileSerializer(profile).data})
