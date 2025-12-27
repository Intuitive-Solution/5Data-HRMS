"""
User admin configuration.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from common.admin import BaseAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin, BaseAdmin):
    """User admin."""
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

