"""
Leave views.
"""
from datetime import date
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Leave, LeaveBalance, LeaveAttachment
from .serializers import LeaveSerializer, CreateLeaveSerializer, LeaveBalanceSerializer, LeaveAttachmentSerializer


class LeavePagination(PageNumberPagination):
    """Pagination class for leaves."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class LeaveViewSet(viewsets.ModelViewSet):
    """Leave viewset."""
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LeavePagination
    search_fields = ['employee__employee_id', 'leave_type']
    ordering_fields = ['start_date', 'created_at']

    def create(self, request, *args, **kwargs):
        """Create a leave with file attachments."""
        data = request.data
        leave_type = data.get('leave_type')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        reason = data.get('reason', '')
        
        try:
            # Create the leave
            leave = Leave.objects.create(
                employee=request.user.employee,
                leave_type=leave_type,
                start_date=start_date_str,
                end_date=end_date_str,
                reason=reason,
                number_of_days=0  # Will be calculated by frontend or business logic
            )
            
            # Handle file attachments
            files = request.FILES.getlist('attachments')
            for file in files:
                LeaveAttachment.objects.create(
                    leave=leave,
                    file=file,
                    name=file.name
                )
            
            serializer = self.get_serializer(leave)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a leave only if start_date is in the future."""
        leave = self.get_object()
        
        # Check if leave can be deleted (start_date > today)
        if leave.start_date <= date.today():
            return Response(
                {'detail': 'Cannot delete leaves that have already started or are in the past'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def my_leaves(self, request):
        """Get current user's leaves with pagination."""
        employee = request.user.employee
        leaves = Leave.objects.filter(employee=employee)
        
        # Apply pagination
        page = self.paginate_queryset(leaves)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(leaves, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Get leave balance. Create if doesn't exist."""
        employee = request.user.employee
        balance, created = LeaveBalance.objects.get_or_create(
            employee=employee,
            defaults={
                'paid_leave': 5,
                'sick_leave': 5,
                'casual_leave': 5,
                'earned_leave': 0,
            }
        )
        serializer = LeaveBalanceSerializer(balance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def holidays(self, request):
        """Get holidays list."""
        # Static holidays list - can be moved to model later
        holidays = [
            {'date': '2025-01-01', 'name': 'New Year Day'},
            {'date': '2025-01-26', 'name': 'Republic Day'},
            {'date': '2025-03-08', 'name': 'Holi'},
            {'date': '2025-04-14', 'name': 'Ambedkar Jayanti'},
            {'date': '2025-04-18', 'name': 'Good Friday'},
            {'date': '2025-05-23', 'name': 'Buddha Purnima'},
            {'date': '2025-08-15', 'name': 'Independence Day'},
            {'date': '2025-08-29', 'name': 'Janmashtami'},
            {'date': '2025-09-16', 'name': 'Milad-un-Nabi'},
            {'date': '2025-10-02', 'name': 'Gandhi Jayanti'},
            {'date': '2025-10-12', 'name': 'Dussehra'},
            {'date': '2025-10-13', 'name': 'Diwali'},
            {'date': '2025-10-14', 'name': 'Diwali (Day 2)'},
            {'date': '2025-10-29', 'name': 'Govardhan Puja'},
            {'date': '2025-11-01', 'name': 'Diwali (Day 5)'},
            {'date': '2025-12-25', 'name': 'Christmas'},
        ]
        return Response(holidays)

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



