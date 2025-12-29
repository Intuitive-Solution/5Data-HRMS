"""
Common admin configuration.
"""
from django.contrib import admin


class BaseAdmin(admin.ModelAdmin):
    """Base admin class with common configurations."""
    readonly_fields = ('created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'is_deleted')

    def get_list_display(self, request):
        list_display = list(super().get_list_display(request) or [])
        list_display.extend(['created_at', 'updated_at'])
        return list_display



