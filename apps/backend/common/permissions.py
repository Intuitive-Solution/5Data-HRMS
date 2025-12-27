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


class IsHROrAdmin(permissions.BasePermission):
    """Only allow HR users or system admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or self._is_hr_user(request.user))
        )

    @staticmethod
    def _is_hr_user(user):
        """Check if user is an HR user. TODO: Implement role-based access control."""
        # For now, check if user is staff
        # This should be updated once role system is implemented
        return user.is_staff

