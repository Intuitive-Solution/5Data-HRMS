"""
Timesheet views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Timesheet
from .serializers import (
    TimesheetSerializer,
    TimesheetCreateUpdateSerializer,
    TimesheetApprovalSerializer
)
from common.permissions import IsReportingManager


class TimesheetViewSet(viewsets.ModelViewSet):
    """Timesheet viewset."""
    queryset = Timesheet.objects.all().select_related('employee', 'approved_by').prefetch_related('rows')
    serializer_class = TimesheetSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee__employee_id']
    ordering_fields = ['week_start', 'created_at']
    ordering = ['-week_start']

    def get_queryset(self):
        """Filter timesheets based on user role."""
        user = self.request.user
        
        # Admins see all timesheets
        if user.has_role('system_admin') or user.has_role('hr_user'):
            return Timesheet.objects.all().select_related('employee', 'approved_by').prefetch_related('rows')
        
        # Reporting managers see their subordinates' timesheets
        if user.has_role('reporting_manager'):
            employee = user.employee
            subordinates = Employee.objects.filter(reporting_manager=employee)
            return Timesheet.objects.filter(
                employee__in=subordinates
            ).select_related('employee', 'approved_by').prefetch_related('rows')
        
        # Employees see only their own timesheets
        return Timesheet.objects.filter(
            employee=user.employee
        ).select_related('employee', 'approved_by').prefetch_related('rows')

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return TimesheetCreateUpdateSerializer
        elif self.action in ['approve', 'reject']:
            return TimesheetApprovalSerializer
        return TimesheetSerializer

    def create(self, request, *args, **kwargs):
        """Create a new timesheet."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validation is handled in serializer.create()
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Set employee to current user when creating."""
        serializer.save(employee=self.request.user.employee)

    def update(self, request, *args, **kwargs):
        """Update a timesheet."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if user can edit this timesheet
        if instance.employee != request.user.employee:
            return Response(
                {'detail': 'You can only edit your own timesheets.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if instance.status not in ['draft', 'rejected']:
            return Response(
                {'detail': f'Cannot modify a {instance.status} timesheet.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Validate daily hours
        try:
            instance.validate_daily_hours()
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_timesheets(self, request):
        """Get current user's timesheets."""
        employee = request.user.employee
        timesheets = Timesheet.objects.filter(
            employee=employee
        ).select_related('employee', 'approved_by').prefetch_related('rows')
        serializer = self.get_serializer(timesheets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def team(self, request):
        """Get team's (subordinates') submitted timesheets for approval."""
        user = request.user
        
        # Only reporting managers can access this
        if not user.has_role('reporting_manager'):
            return Response(
                {'detail': 'Only reporting managers can access team timesheets.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        employee = user.employee
        subordinates = Employee.objects.filter(reporting_manager=employee)
        timesheets = Timesheet.objects.filter(
            employee__in=subordinates,
            status__in=['submitted', 'rejected']
        ).select_related('employee', 'approved_by').prefetch_related('rows').order_by('-week_start')
        
        serializer = self.get_serializer(timesheets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a timesheet."""
        timesheet = self.get_object()
        
        # Check permissions
        if timesheet.employee != request.user.employee:
            return Response(
                {'detail': 'You can only submit your own timesheets.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if timesheet.status != 'draft':
            return Response(
                {'detail': f'Cannot submit a {timesheet.status} timesheet.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate daily hours before submission
        try:
            timesheet.validate_daily_hours()
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        timesheet.status = 'submitted'
        timesheet.submitted_at = timezone.now()
        timesheet.save()
        
        serializer = self.get_serializer(timesheet)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a timesheet."""
        timesheet = self.get_object()
        
        # Check if user is the reporting manager
        if timesheet.employee.reporting_manager != request.user.employee:
            return Response(
                {'detail': 'Only the reporting manager can approve this timesheet.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if timesheet.status != 'submitted':
            return Response(
                {'detail': f'Can only approve submitted timesheets. Current status: {timesheet.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timesheet.status = 'approved'
        timesheet.approved_at = timezone.now()
        timesheet.approved_by = request.user.employee
        timesheet.save()
        
        serializer = self.get_serializer(timesheet)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a timesheet."""
        timesheet = self.get_object()
        
        # Check if user is the reporting manager
        if timesheet.employee.reporting_manager != request.user.employee:
            return Response(
                {'detail': 'Only the reporting manager can reject this timesheet.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if timesheet.status != 'submitted':
            return Response(
                {'detail': f'Can only reject submitted timesheets. Current status: {timesheet.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TimesheetApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        timesheet.status = 'rejected'
        timesheet.rejection_reason = serializer.validated_data.get('rejection_reason', '')
        timesheet.save()
        
        serializer = self.get_serializer(timesheet)
        return Response(serializer.data)


# Import Employee at the end to avoid circular imports
from employees.models import Employee



