"""
Timesheet views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Timesheet, TimesheetEntry
from .serializers import TimesheetSerializer, TimesheetEntrySerializer


class TimesheetViewSet(viewsets.ModelViewSet):
    """Timesheet viewset."""
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee__employee_id']
    ordering_fields = ['week_start', 'created_at']

    @action(detail=False, methods=['get'])
    def my_timesheets(self, request):
        """Get current user's timesheets."""
        employee = request.user.employee
        timesheets = Timesheet.objects.filter(employee=employee)
        serializer = self.get_serializer(timesheets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a timesheet."""
        # TODO: Implement timesheet submission logic
        return Response({'detail': 'Timesheet submitted'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a timesheet."""
        # TODO: Implement timesheet approval logic
        return Response({'detail': 'Timesheet approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a timesheet."""
        # TODO: Implement timesheet rejection logic
        return Response({'detail': 'Timesheet rejected'})

