"""
Common utility functions.
"""
import logging
from audit.models import AuditLog


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

    logger = logging.getLogger('audit')
    logger.info(
        f'{user.email} - {action} - {entity}:{entity_id}'
    )

