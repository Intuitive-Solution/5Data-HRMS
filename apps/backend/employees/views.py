"""
Employee views.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer, CreateEmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """Employee viewset."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee_id', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['employee_id', 'date_of_joining']

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's employee profile."""
        try:
            employee = request.user.employee
            serializer = self.get_serializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee profile not found'}, status=404)

