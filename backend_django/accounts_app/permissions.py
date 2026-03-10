from rest_framework.permissions import BasePermission


def _has_role(request, expected_roles):
    if not (request.user and request.user.is_authenticated):
        return False
    role = getattr(request.user, "user_type", "")
    return role in expected_roles


class IsDonor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"DONOR"})


class IsAcceptor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"ACCEPTOR"})


class IsHospital(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"HOSPITAL"})


class IsRecipient(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"ACCEPTOR"})


class IsAdminUserType(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, {"ADMIN"})
