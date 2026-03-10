from rest_framework.permissions import BasePermission


class IsHospitalUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "user_type", None) == "HOSPITAL"
        )


class IsAcceptorUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "user_type", None) == "ACCEPTOR"
        )
