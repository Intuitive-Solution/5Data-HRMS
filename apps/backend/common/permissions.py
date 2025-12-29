"""
Custom permission classes for role-based access control.
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


class IsSystemAdmin(permissions.BasePermission):
    """Only allow system admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('system_admin')
        )


class IsHR(permissions.BasePermission):
    """Only allow HR users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('hr_user')
        )


class IsHROrSystemAdmin(permissions.BasePermission):
    """Only allow HR users or system admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.has_role('hr_user') or request.user.has_role('system_admin'))
        )


class IsFinance(permissions.BasePermission):
    """Only allow finance users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('finance_user')
        )


class IsProjectManager(permissions.BasePermission):
    """Only allow project managers."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('project_manager')
        )


class IsProjectLead(permissions.BasePermission):
    """Only allow project leads."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('project_lead')
        )


class IsReportingManager(permissions.BasePermission):
    """Only allow reporting managers."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_role('reporting_manager')
        )


# Legacy alias for backward compatibility
IsAdmin = IsSystemAdmin
IsHROrAdmin = IsHROrSystemAdmin

