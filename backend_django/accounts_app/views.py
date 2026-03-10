from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction
from django.utils.text import slugify
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from audit_app.services import audit_log
from hospitals.models import Hospital, HospitalStaffUser
from hospitals.serializers import HospitalSerializer
from hospitals.services import ensure_hospital_staff_mapping, get_hospital_for_user
from .permissions import IsAdminUserType
from .serializers import LoginSerializer, RegisterSerializer, HospitalRegisterSerializer, UserSerializer


User = get_user_model()


def _ok(data, status_code=status.HTTP_200_OK):
    return Response({"success": True, "data": data}, status=status_code)


def _error(message, code="BAD_REQUEST", details=None, status_code=status.HTTP_400_BAD_REQUEST):
    payload = {"code": code, "message": message}
    if details:
        payload["details"] = details
    return Response({"success": False, "error": payload}, status=status_code)


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def _authenticate_identifier(identifier, password):
    normalized_identifier = (identifier or "").strip()

    # Prefer username auth first to stay compatible with Django defaults.
    user = authenticate(username=normalized_identifier, password=password)
    if user:
        return user

    email_user = User.objects.filter(email__iexact=normalized_identifier).first()
    if email_user:
        email_auth = authenticate(username=email_user.username, password=password)
        if email_auth:
            return email_auth

    phone_user = User.objects.filter(phone=normalized_identifier).first()
    if phone_user:
        return authenticate(username=phone_user.username, password=password)

    return None


def _build_hospital_username(hospital_name: str, email: str) -> str:
    base_name = slugify(hospital_name or "")
    if not base_name:
        base_name = slugify((email or "").split("@")[0])
    if not base_name:
        base_name = "hospital"

    candidate = base_name[:140]
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        suffix += 1
        dynamic_suffix = f"-{suffix}"
        candidate = f"{base_name[:max(1, 140 - len(dynamic_suffix))]}{dynamic_suffix}"

    return candidate


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return _error("Validation failed", details=serializer.errors)

    user = serializer.save()
    ensure_hospital_staff_mapping(user)
    audit_log(actor=user, action="USER_REGISTERED", entity_type="User", entity_id=user.id)
    return _ok(
        {
            "user": UserSerializer(user).data,
            "tokens": _tokens_for_user(user),
        },
        status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register_hospital(request):
    serializer = HospitalRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return _error("Validation failed", details=serializer.errors)

    data = serializer.validated_data
    email = data["email"].strip().lower()
    phone = str(data["phone"]).strip()
    registration_number = data["registration_number"].strip()

    details = {}
    if User.objects.filter(email__iexact=email).exists():
        details["email"] = ["A user with this email already exists."]
    if phone and User.objects.filter(phone=phone).exists():
        details["phone"] = ["A user with this phone already exists."]
    if Hospital.objects.filter(license_id__iexact=registration_number).exists():
        details["registration_number"] = ["A hospital with this registration/license number already exists."]
    if details:
        return _error("Validation failed", details=details)

    try:
        with transaction.atomic():
            username = _build_hospital_username(data["hospital_name"], email)
            user = User.objects.create_user(
                username=username,
                email=email,
                phone=phone,
                password=data["password"],
                user_type=User.ROLE_HOSPITAL,
                address=data["address_line_1"],
                city=data["city"],
                state=data["state"],
                location=f"{data['city']}, {data['state']}",
            )

            hospital = Hospital.objects.create(
                name=data["hospital_name"],
                license_id=registration_number,
                institution_type=data["institution_type"],
                email=email,
                phone=phone,
                address=data["address_line_1"],
                address_line_1=data["address_line_1"],
                address_line_2=data.get("address_line_2") or "",
                city=data["city"],
                state=data["state"],
                pincode=data["pincode"],
                contact_person_name=data["contact_person_name"],
                contact_person_role=data["contact_person_role"],
                contact_person_phone=data["contact_person_phone"],
                blood_bank_available=bool(data.get("blood_bank_available")),
                organ_transplant_support=bool(data.get("organ_transplant_support")),
                emergency_response=bool(data.get("emergency_response")),
                supported_blood_groups=data.get("supported_blood_groups") or [],
                license_document_name=data.get("license_document_name"),
                hospital_id_proof_name=data.get("hospital_id_proof_name"),
                approval_status=Hospital.PENDING,
            )

            HospitalStaffUser.objects.create(hospital=hospital, user=user)

            audit_log(actor=user, action="HOSPITAL_REGISTERED", entity_type="Hospital", entity_id=hospital.id)

    except IntegrityError:
        return _error("Could not complete hospital registration. Please retry.", code="CONFLICT", status_code=409)

    return _ok(
        {
            "message": "Hospital registration submitted successfully. Awaiting admin approval.",
            "verification_status": hospital.approval_status,
            "hospital": HospitalSerializer(hospital).data,
        },
        status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return _error("Validation failed", details=serializer.errors)

    user = _authenticate_identifier(
        identifier=serializer.validated_data["identifier"],
        password=serializer.validated_data["password"],
    )
    if not user:
        return _error("Invalid credentials", code="AUTH_FAILED", status_code=status.HTTP_401_UNAUTHORIZED)

    if getattr(user, "user_type", "") == User.ROLE_HOSPITAL:
        hospital = get_hospital_for_user(user) or ensure_hospital_staff_mapping(user)
        if hospital and hospital.approval_status != Hospital.APPROVED:
            return _error(
                "Your hospital account is pending verification.",
                code="HOSPITAL_PENDING",
                details={"verification_status": hospital.approval_status},
                status_code=status.HTTP_403_FORBIDDEN,
            )

    ensure_hospital_staff_mapping(user)

    return _ok(
        {
            "user": UserSerializer(user).data,
            "tokens": _tokens_for_user(user),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return _ok({"message": "Logged out"})

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return _error("Invalid refresh token", code="TOKEN_INVALID", status_code=status.HTTP_400_BAD_REQUEST)
    return _ok({"message": "Logged out"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return _ok(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_users(request):
    users = User.objects.order_by("-created_at")
    return _ok(UserSerializer(users, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_update_user(request, user_id):
    user = User.objects.filter(id=user_id).first()
    if not user:
        return _error("User not found", code="NOT_FOUND", status_code=status.HTTP_404_NOT_FOUND)

    is_active = request.data.get("is_active")
    if is_active is None:
        return _error("`is_active` is required")

    user.is_active = bool(is_active)
    user.save(update_fields=["is_active", "updated_at"])
    audit_log(
        actor=request.user,
        action="USER_STATUS_UPDATED",
        entity_type="User",
        entity_id=user.id,
        metadata={"is_active": user.is_active},
    )
    return _ok(UserSerializer(user).data)
