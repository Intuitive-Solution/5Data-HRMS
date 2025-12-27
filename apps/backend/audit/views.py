"""
Audit views.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit log viewset (read-only)."""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['user__email', 'action', 'entity']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

