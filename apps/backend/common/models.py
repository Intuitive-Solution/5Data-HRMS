"""
Common models shared across apps.
"""
from django.db import models


class BaseModel(models.Model):
    """Abstract base model with common fields."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteManager(models.Manager):
    """Manager for soft-deleted records."""

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def all_including_deleted(self):
        return super().get_queryset()


class SoftDeleteModel(BaseModel):
    """Model with soft delete capability."""
    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete the instance."""
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])

    def restore(self):
        """Restore a soft-deleted instance."""
        self.is_deleted = False
        self.save(update_fields=['is_deleted', 'updated_at'])

