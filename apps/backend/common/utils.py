"""
Common utility functions.
"""
import logging
from audit.models import AuditLog

logger = logging.getLogger('audit')


def log_audit_action(user, action, entity, entity_id, metadata=None, request=None):
    """Log an audit action."""
    ip_address = '0.0.0.0'
    user_agent = None

    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    AuditLog.objects.create(
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        metadata=metadata or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )

    logger.info(
        f'{user.email} - {action} - {entity}:{entity_id}'
    )


class AuditTrailMixin:
    """Mixin to automatically log model changes to audit trail."""

    @staticmethod
    def get_field_changes(instance, original_values):
        """Get a dictionary of changed fields."""
        changes = {}
        for field_name, original_value in original_values.items():
            current_value = getattr(instance, field_name, None)
            if original_value != current_value:
                changes[field_name] = {
                    'old_value': str(original_value),
                    'new_value': str(current_value)
                }
        return changes

    @staticmethod
    def log_create(user, instance, request=None):
        """Log instance creation."""
        log_audit_action(
            user=user,
            action='CREATE',
            entity=instance.__class__.__name__,
            entity_id=str(instance.id),
            metadata={'model': instance.__class__.__name__},
            request=request
        )

    @staticmethod
    def log_update(user, instance, original_values, request=None):
        """Log instance update with field changes."""
        changes = AuditTrailMixin.get_field_changes(instance, original_values)
        if changes:
            log_audit_action(
                user=user,
                action='UPDATE',
                entity=instance.__class__.__name__,
                entity_id=str(instance.id),
                metadata={'changes': changes, 'model': instance.__class__.__name__},
                request=request
            )

    @staticmethod
    def log_delete(user, instance, request=None):
        """Log instance deletion."""
        log_audit_action(
            user=user,
            action='DELETE',
            entity=instance.__class__.__name__,
            entity_id=str(instance.id),
            metadata={'model': instance.__class__.__name__},
            request=request
        )

