"""
Admin configuration for the documents app.
"""
from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin configuration for Document model."""
    list_display = [
        'title',
        'file_type',
        'file_size',
        'uploaded_by',
        'created_at',
        'is_deleted',
    ]
    list_filter = ['file_type', 'is_deleted', 'created_at']
    search_fields = ['title', 'description', 'uploaded_by__email']
    readonly_fields = ['file_size', 'file_type', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'file', 'visible_to')
        }),
        ('Metadata', {
            'fields': ('file_size', 'file_type', 'uploaded_by'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted'),
            'classes': ('collapse',)
        }),
    )
