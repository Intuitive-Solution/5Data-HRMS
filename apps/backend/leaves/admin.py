"""
Leave admin.
"""
from django.contrib import admin
from common.admin import BaseAdmin
from .models import Leave, LeaveBalance


@admin.register(Leave)
class LeaveAdmin(BaseAdmin):
    """Leave admin."""
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status')
    search_fields = ('employee__employee_id', 'employee__user__email')
    list_filter = ('leave_type', 'status', 'start_date')


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    """Leave balance admin."""
    list_display = ('employee', 'sick_leave', 'casual_leave', 'earned_leave')
    search_fields = ('employee__employee_id', 'employee__user__email')

