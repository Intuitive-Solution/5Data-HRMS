"""
Employee admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Employee, EmployeeDocument


@admin.register(Employee)
class EmployeeAdmin(BaseAdmin):
    """Employee admin."""
    list_display = ('employee_id', 'user', 'department', 'job_title', 'employment_status', 'date_of_joining')
    search_fields = ('employee_id', 'user__email', 'department', 'user__first_name', 'user__last_name')
    list_filter = ('employment_type', 'employment_status', 'department', 'date_of_joining')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'picture')
        }),
        ('Personal Information', {
            'fields': ('middle_name', 'personal_email', 'phone_number', 'gender', 'address', 'date_of_birth', 'nationality')
        }),
        ('Job Information', {
            'fields': ('job_title', 'probation_policy', 'reporting_manager')
        }),
        ('Work Information', {
            'fields': ('department', 'location', 'shift', 'employment_type', 'date_of_joining', 'contract_end_date', 'contractor_company')
        }),
        ('Employment Status', {
            'fields': ('employment_status', 'termination_date', 'termination_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(BaseAdmin):
    """Employee document admin."""
    list_display = ('name', 'employee', 'document_type', 'uploaded_by', 'created_at')
    search_fields = ('name', 'employee__employee_id', 'document_type')
    list_filter = ('document_type', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Document Information', {
            'fields': ('employee', 'name', 'document_type', 'file', 'uploaded_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_deleted')
        }),
    )

