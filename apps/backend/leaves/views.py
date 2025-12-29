"""
Leave views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Leave, LeaveBalance
from .serializers import LeaveSerializer, CreateLeaveSerializer, LeaveBalanceSerializer


class LeaveViewSet(viewsets.ModelViewSet):
    """Leave viewset."""
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee__employee_id', 'leave_type']
    ordering_fields = ['start_date', 'created_at']

    @action(detail=False, methods=['get'])
    def my_leaves(self, request):
        """Get current user's leaves."""
        employee = request.user.employee
        leaves = Leave.objects.filter(employee=employee)
        serializer = self.get_serializer(leaves, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Get leave balance."""
        try:
            balance = LeaveBalance.objects.get(employee=request.user.employee)
            serializer = LeaveBalanceSerializer(balance)
            return Response(serializer.data)
        except LeaveBalance.DoesNotExist:
            return Response(
                {'detail': 'Leave balance not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave."""
        # TODO: Implement leave approval logic
        return Response({'detail': 'Leave approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave."""
        # TODO: Implement leave rejection logic
        return Response({'detail': 'Leave rejected'})



