"""
Timesheet serializers.
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Timesheet, TimesheetRow
from projects.models import Project


class TimesheetRowSerializer(serializers.ModelSerializer):
    """Timesheet row serializer."""
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_client = serializers.CharField(source='project.client', read_only=True)
    row_total = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TimesheetRow
        fields = (
            'id', 'project', 'project_name', 'project_client', 'task_description',
            'sun_hours', 'mon_hours', 'tue_hours', 'wed_hours',
            'thu_hours', 'fri_hours', 'sat_hours', 'row_total',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_row_total(self, obj):
        """Calculate total hours for this row."""
        return float(obj.get_row_total())


class TimesheetSerializer(serializers.ModelSerializer):
    """Timesheet serializer with nested rows."""
    rows = TimesheetRowSerializer(many=True, read_only=True)
    daily_totals = serializers.SerializerMethodField(read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.SerializerMethodField(read_only=True)
    approved_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Timesheet
        fields = (
            'id', 'employee', 'employee_id', 'employee_name', 'week_start', 'week_end',
            'status', 'total_hours', 'submitted_at', 'approved_at', 'approved_by',
            'approved_by_name', 'rejection_reason', 'rows', 'daily_totals',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'submitted_at', 'approved_at', 'approved_by',
            'created_at', 'updated_at', 'total_hours', 'daily_totals'
        )

    def get_employee_name(self, obj):
        """Get employee's full name."""
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"

    def get_approved_by_name(self, obj):
        """Get approver's full name."""
        if obj.approved_by:
            return f"{obj.approved_by.user.first_name} {obj.approved_by.user.last_name}"
        return None

    def get_daily_totals(self, obj):
        """Get total hours per day."""
        return obj.get_daily_totals()


class TimesheetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating timesheets with nested rows."""
    rows = TimesheetRowSerializer(many=True, required=False)

    class Meta:
        model = Timesheet
        fields = ('id', 'week_start', 'week_end', 'rows')
        read_only_fields = ('id',)

    def validate_rows(self, rows_data):
        """Validate rows data."""
        if not rows_data:
            raise serializers.ValidationError("At least one row is required.")
        
        # Validate that all projects exist
        for row_data in rows_data:
            project = row_data.get('project')
            
            # Handle both Project object and ID
            if isinstance(project, Project):
                project_id = project.id
            elif isinstance(project, (int, str)):
                project_id = int(project)
            else:
                raise serializers.ValidationError(f"Invalid project value: {project}")
            
            if not Project.objects.filter(id=project_id).exists():
                raise serializers.ValidationError(f"Project {project_id} does not exist.")
            
            # Ensure we store the ID, not the object
            row_data['project'] = project_id
        
        return rows_data

    def create(self, validated_data):
        """Create timesheet with nested rows."""
        rows_data = validated_data.pop('rows')
        timesheet = Timesheet.objects.create(**validated_data)
        
        try:
            for row_data in rows_data:
                # Extract project and convert to ID if needed
                project = row_data.pop('project', None)
                if project is not None:
                    if isinstance(project, Project):
                        project_id = project.id
                    else:
                        project_id = int(project)
                    row_data['project_id'] = project_id
            
                TimesheetRow.objects.create(timesheet=timesheet, **row_data)
            
            # Validate daily hours after creating rows
            timesheet.validate_daily_hours()
            
            # Calculate total hours
            timesheet.calculate_total_hours()
            timesheet.save()
        except ValidationError:
            # If validation fails, delete the timesheet and re-raise
            timesheet.delete()
            raise
        
        return timesheet

    def update(self, instance, validated_data):
        """Update timesheet with nested rows."""
        rows_data = validated_data.pop('rows', None)
        
        # Update timesheet fields
        instance.week_start = validated_data.get('week_start', instance.week_start)
        instance.week_end = validated_data.get('week_end', instance.week_end)
        
        # Only allow update if status is draft or rejected
        if instance.status not in ['draft', 'rejected']:
            raise serializers.ValidationError("Cannot modify a submitted or approved timesheet.")
        
        if rows_data is not None:
            # Delete existing rows and create new ones
            instance.rows.all().delete()
            for row_data in rows_data:
                # Extract project and convert to ID if needed
                project = row_data.pop('project', None)
                if project is not None:
                    if isinstance(project, Project):
                        project_id = project.id
                    else:
                        project_id = int(project)
                    row_data['project_id'] = project_id
                
                TimesheetRow.objects.create(timesheet=instance, **row_data)
        
        # Validate daily hours
        try:
            instance.validate_daily_hours()
        except ValidationError as e:
            # Convert Django ValidationError to DRF ValidationError
            raise serializers.ValidationError(str(e))
        
        # Calculate total hours
        instance.calculate_total_hours()
        instance.save()
        
        return instance


class TimesheetApprovalSerializer(serializers.Serializer):
    """Serializer for approval/rejection actions."""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)

    def validate(self, data):
        """Validate that rejection_reason is provided when rejecting."""
        if data.get('action') == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError("rejection_reason is required when rejecting.")
        return data



