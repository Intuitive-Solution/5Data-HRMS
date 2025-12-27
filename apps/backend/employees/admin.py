"""
Employee admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(BaseAdmin):
    """Employee admin."""
    list_display = ('employee_id', 'user', 'department', 'job_role', 'employment_type', 'date_of_joining')
    search_fields = ('employee_id', 'user__email', 'department')
    list_filter = ('employment_type', 'department', 'date_of_joining')
    fieldsets = (
        (None, {'fields': ('user', 'employee_id', 'department', 'job_role')}),
        ('Employment', {'fields': ('employment_type', 'date_of_joining', 'contract_end_date')}),
        ('Hierarchy', {'fields': ('reporting_manager',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'is_deleted')}),
    )

