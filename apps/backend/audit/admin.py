"""
Audit admin.
"""
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Audit log admin."""
    list_display = ('user', 'action', 'entity', 'timestamp', 'ip_address')
    search_fields = ('user__email', 'action', 'entity')
    list_filter = ('action', 'timestamp', 'entity')
    readonly_fields = ('user', 'action', 'entity', 'entity_id', 'timestamp', 'ip_address', 'user_agent', 'metadata')
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

