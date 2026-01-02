"""
Settings admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Department, Location, Holiday, Client


@admin.register(Department)
class DepartmentAdmin(BaseAdmin):
    """Department admin."""
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Department Information', {
            'fields': ('name', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )


@admin.register(Location)
class LocationAdmin(BaseAdmin):
    """Location admin."""
    list_display = ('name', 'address', 'created_at', 'updated_at')
    search_fields = ('name', 'address')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Location Information', {
            'fields': ('name', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )


@admin.register(Holiday)
class HolidayAdmin(BaseAdmin):
    """Holiday admin."""
    list_display = ('name', 'date', 'is_optional', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('is_optional', 'date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Holiday Information', {
            'fields': ('name', 'date', 'is_optional')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )


@admin.register(Client)
class ClientAdmin(BaseAdmin):
    """Client admin."""
    list_display = ('code', 'name', 'status', 'created_at', 'updated_at')
    search_fields = ('code', 'name', 'description', 'address', 'contact_person', 'person_name', 'email', 'phone')
    list_filter = ('status', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Client Information', {
            'fields': (
                'code',
                'name',
                'description',
                'address',
                'contact_person',
                'person_name',
                'email',
                'phone',
                'status',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )

