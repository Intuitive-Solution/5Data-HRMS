"""
Project admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Project, ProjectAssignment


@admin.register(Project)
class ProjectAdmin(BaseAdmin):
    """Project admin."""
    list_display = ('name', 'client', 'billing_type', 'status', 'start_date')
    search_fields = ('name', 'client')
    list_filter = ('billing_type', 'status', 'start_date')


@admin.register(ProjectAssignment)
class ProjectAssignmentAdmin(admin.ModelAdmin):
    """Project assignment admin."""
    list_display = ('employee', 'project', 'role', 'assigned_date')
    search_fields = ('employee__employee_id', 'project__name')
    list_filter = ('assigned_date', 'project')

