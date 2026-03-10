from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from audit_app.services import audit_log
from notifications_app.models import Notification
from notifications_app.services import create_notification

from .models import Request
from .permissions import IsAcceptorUser
from .serializers import RequestSerializer, RequestUpdateSerializer
from .services import can_transition, transition_request


def _ok(data, status_code=status.HTTP_200_OK):
    return Response({"success": True, "data": data}, status=status_code)


def _error(message, code="BAD_REQUEST", status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "error": {"code": code, "message": message}}, status=status_code)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAcceptorUser])
def create_blood_request(request):
    payload = request.data.copy()
    payload["request_type"] = Request.BLOOD

    serializer = RequestSerializer(data=payload)
    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed",
                    "details": serializer.errors,
                },
            },
            status=400,
        )

    request_obj = serializer.save(created_by=request.user, status=Request.SUBMITTED)

    audit_log(
        actor=request.user,
        action="BLOOD_REQUEST_CREATED",
        entity_type="Request",
        entity_id=request_obj.id,
    )

    return _ok(RequestSerializer(request_obj).data, status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAcceptorUser])
def create_organ_request(request):
    payload = request.data.copy()
    payload["request_type"] = Request.ORGAN

    serializer = RequestSerializer(data=payload)
    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed",
                    "details": serializer.errors,
                },
            },
            status=400,
        )

    request_obj = serializer.save(created_by=request.user, status=Request.SUBMITTED)

    audit_log(
        actor=request.user,
        action="ORGAN_REQUEST_CREATED",
        entity_type="Request",
        entity_id=request_obj.id,
    )

    return _ok(RequestSerializer(request_obj).data, status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def emergency_requests(request):
    role = getattr(request.user, "user_type", "")

    if request.method == "GET":
        qs = Request.objects.filter(urgency=Request.CRITICAL).exclude(status=Request.CANCELLED).order_by("-updated_at")

        if role == "ACCEPTOR":
            qs = qs.filter(created_by=request.user)

        return _ok(RequestSerializer(qs[:300], many=True).data)

    if role not in {"ACCEPTOR", "HOSPITAL", "ADMIN"}:
        return _error("Forbidden", code="FORBIDDEN", status_code=status.HTTP_403_FORBIDDEN)

    payload = request.data.copy()
    request_type = str(payload.get("request_type") or "").upper()

    if request_type not in {Request.BLOOD, Request.ORGAN}:
        request_type = Request.ORGAN if payload.get("organ_type") else Request.BLOOD

    payload["request_type"] = request_type
    payload["urgency"] = Request.CRITICAL

    if request_type == Request.BLOOD and not payload.get("units_needed"):
        payload["units_needed"] = 1

    serializer = RequestSerializer(data=payload)
    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed",
                    "details": serializer.errors,
                },
            },
            status=400,
        )

    request_obj = serializer.save(created_by=request.user, status=Request.SUBMITTED)

    create_notification(
        user=request.user,
        title="Emergency request submitted",
        message=f"Request #{request_obj.id} is marked as emergency priority.",
        notification_type=Notification.TYPE_REQUEST_UPDATE,
    )

    audit_log(
        actor=request.user,
        action="EMERGENCY_REQUEST_CREATED",
        entity_type="Request",
        entity_id=request_obj.id,
    )

    return _ok(RequestSerializer(request_obj).data, status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAcceptorUser])
def my_requests(request):
    qs = Request.objects.filter(created_by=request.user).order_by("-created_at")
    return _ok(RequestSerializer(qs[:300], many=True).data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def request_detail(request, request_id):
    req = Request.objects.filter(id=request_id).first()

    if not req:
        return _error("Request not found", code="NOT_FOUND", status_code=status.HTTP_404_NOT_FOUND)

    user_role = getattr(request.user, "user_type", "")
    is_owner = req.created_by_id == request.user.id

    if not is_owner and user_role not in {"ADMIN", "HOSPITAL"}:
        return _error("Forbidden", code="FORBIDDEN", status_code=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        return _ok(RequestSerializer(req).data)

    if not is_owner:
        return _error("Only owner can update or cancel", code="FORBIDDEN", status_code=status.HTTP_403_FORBIDDEN)

    if req.status == Request.FULFILLED:
        return _error("Fulfilled request cannot be edited or cancelled", code="INVALID_STATE")

    target_status = request.data.get("status")

    if target_status:
        if target_status != Request.CANCELLED:
            return _error("Only cancellation is allowed through this endpoint")

        if not can_transition(req.status, Request.CANCELLED):
            return _error("Cannot cancel request in current status", code="INVALID_TRANSITION")

        transition_request(req, Request.CANCELLED)

        create_notification(
            user=request.user,
            title="Request cancelled",
            message=f"Request #{req.id} was cancelled.",
            notification_type=Notification.TYPE_REQUEST_UPDATE,
        )

        audit_log(
            actor=request.user,
            action="REQUEST_CANCELLED",
            entity_type="Request",
            entity_id=req.id,
        )

        return _ok(RequestSerializer(req).data)

    serializer = RequestUpdateSerializer(req, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed",
                    "details": serializer.errors,
                },
            },
            status=400,
        )

    serializer.save()

    audit_log(
        actor=request.user,
        action="REQUEST_UPDATED",
        entity_type="Request",
        entity_id=req.id,
    )

    return _ok(RequestSerializer(req).data)
