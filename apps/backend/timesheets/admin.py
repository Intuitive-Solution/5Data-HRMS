"""
Timesheet admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Timesheet, TimesheetEntry


@admin.register(Timesheet)
class TimesheetAdmin(BaseAdmin):
    """Timesheet admin."""
    list_display = ('employee', 'week_start', 'status', 'total_hours')
    search_fields = ('employee__employee_id', 'employee__user__email')
    list_filter = ('status', 'week_start')


@admin.register(TimesheetEntry)
class TimesheetEntryAdmin(admin.ModelAdmin):
    """Timesheet entry admin."""
    list_display = ('timesheet', 'date', 'project', 'hours')
    search_fields = ('timesheet__employee__employee_id', 'project__name')
    list_filter = ('date', 'project')

