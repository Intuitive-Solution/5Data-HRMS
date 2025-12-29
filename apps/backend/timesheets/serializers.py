"""
Timesheet serializers.
"""
from rest_framework import serializers
from .models import Timesheet, TimesheetEntry


class TimesheetEntrySerializer(serializers.ModelSerializer):
    """Timesheet entry serializer."""
    class Meta:
        model = TimesheetEntry
        fields = (
            'id', 'date', 'project', 'hours', 'task_description',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class TimesheetSerializer(serializers.ModelSerializer):
    """Timesheet serializer."""
    entries = TimesheetEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Timesheet
        fields = (
            'id', 'employee', 'week_start', 'week_end', 'status',
            'total_hours', 'submitted_at', 'approved_at', 'approved_by',
            'rejection_reason', 'entries', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'submitted_at', 'approved_at', 'approved_by',
            'created_at', 'updated_at'
        )



