"""
Report views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from timesheets.models import Timesheet
from leaves.models import Leave


class ReportViewSet(viewsets.ViewSet):
    """Report viewset."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def timesheets(self, request):
        """Get timesheet report."""
        # TODO: Implement timesheet report logic
        return Response({'detail': 'Timesheet report'})

    @action(detail=False, methods=['get'])
    def leaves(self, request):
        """Get leave report."""
        # TODO: Implement leave report logic
        return Response({'detail': 'Leave report'})

    @action(detail=False, methods=['get'])
    def billing(self, request):
        """Get billing report."""
        # TODO: Implement billing report logic
        return Response({'detail': 'Billing report'})

