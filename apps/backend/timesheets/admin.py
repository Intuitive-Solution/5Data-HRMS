"""
Timesheet admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Timesheet, TimesheetRow


class TimesheetRowInline(admin.TabularInline):
    """Inline admin for timesheet rows."""
    model = TimesheetRow
    fields = ('project', 'task_description', 'sun_hours', 'mon_hours', 'tue_hours',
              'wed_hours', 'thu_hours', 'fri_hours', 'sat_hours')
    extra = 0


@admin.register(Timesheet)
class TimesheetAdmin(BaseAdmin):
    """Timesheet admin."""
    list_display = ('employee', 'week_start', 'week_end', 'status', 'total_hours')
    search_fields = ('employee__employee_id', 'employee__user__email')
    list_filter = ('status', 'week_start')
    inlines = [TimesheetRowInline]
    readonly_fields = ('total_hours', 'submitted_at', 'approved_at', 'approved_by')


@admin.register(TimesheetRow)
class TimesheetRowAdmin(admin.ModelAdmin):
    """Timesheet row admin."""
    list_display = ('timesheet', 'project', 'task_description', 'get_row_total')
    search_fields = ('timesheet__employee__employee_id', 'project__name', 'task_description')
    list_filter = ('project', 'created_at')
    
    def get_row_total(self, obj):
        return obj.get_row_total()
    get_row_total.short_description = 'Total Hours'



