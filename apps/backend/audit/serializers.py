"""
Audit serializers.
"""
from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """Audit log serializer."""
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            'id', 'user', 'user_email', 'action', 'entity', 'entity_id',
            'timestamp', 'ip_address', 'user_agent', 'metadata'
        )
        read_only_fields = (
            'id', 'timestamp', 'ip_address', 'user_agent', 'metadata'
        )



