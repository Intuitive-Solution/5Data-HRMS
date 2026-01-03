"""
Document models for company-wide document management with role-based visibility.
"""
import os
from django.db import models
from django.conf import settings
from common.models import SoftDeleteModel


def document_upload_path(instance, filename):
    """Generate upload path for documents."""
    return f'documents/{filename}'


class Document(SoftDeleteModel):
    """
    Company document model with role-based visibility.
    
    Documents are visible only to users whose role is in the visible_to list.
    Admin and HR users can see all documents regardless of visible_to.
    """
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=document_upload_path)
    file_size = models.CharField(max_length=50)  # Human-readable size
    file_type = models.CharField(max_length=20)  # pdf, docx, xlsx, etc.
    visible_to = models.JSONField(
        default=list,
        help_text="List of role names that can view this document"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['file_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title

    @staticmethod
    def get_file_type_from_extension(filename):
        """Extract file type from filename extension."""
        ext = os.path.splitext(filename)[1].lower().lstrip('.')
        type_mapping = {
            'pdf': 'pdf',
            'doc': 'docx',
            'docx': 'docx',
            'xls': 'xlsx',
            'xlsx': 'xlsx',
            'ppt': 'pptx',
            'pptx': 'pptx',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'webp': 'image',
            'txt': 'txt',
            'csv': 'csv',
            'zip': 'zip',
            'rar': 'zip',
        }
        return type_mapping.get(ext, 'other')

    @staticmethod
    def format_file_size(size_bytes):
        """Convert bytes to human-readable format."""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

    def is_visible_to_user(self, user):
        """
        Check if document is visible to a specific user.
        
        Admin and HR can see all documents.
        Other users can only see documents where their role is in visible_to.
        """
        user_roles = user.get_role_names()
        
        # Admin and HR can see all documents
        if 'system_admin' in user_roles or 'hr_user' in user_roles:
            return True
        
        # Check if any of user's roles match visible_to
        return any(role in self.visible_to for role in user_roles)
