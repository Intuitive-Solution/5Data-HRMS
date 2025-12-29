"""
Audit views.
"""
from rest_framework import viewsets
from .models import AuditLog
from .serializers import AuditLogSerializer
from common.permissions import IsSystemAdmin


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit log viewset (read-only)."""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsSystemAdmin]
    search_fields = ['user__email', 'action', 'entity']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

