"""
Custom permission classes.
"""
from rest_framework import permissions


class IsActive(permissions.BasePermission):
    """Only allow active users to access."""

    def has_permission(self, request, view):
        return request.user and request.user.is_active


class IsAuthenticated(permissions.BasePermission):
    """Require authentication."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(permissions.BasePermission):
    """Only allow system admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )

