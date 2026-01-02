"""
Employee views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from django.contrib.auth import get_user_model
from .models import Employee, EmployeeDocument
from .serializers import (
    EmployeeSerializer, CreateEmployeeSerializer, 
    UpdateEmployeeSerializer, EmployeeDocumentSerializer
)
from common.permissions import IsHROrSystemAdmin
from common.utils import AuditTrailMixin

User = get_user_model()


class EmployeeViewSet(viewsets.ModelViewSet):
    """Employee viewset with full CRUD and document management."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    # Updated search_fields: department is now a ForeignKey, so search on department__name
    search_fields = ['employee_id', 'user__email', 'user__first_name', 'user__last_name', 'department__name', 'job_title']
    ordering_fields = [
        'employee_id', 
        'user__first_name', 
        'user__last_name',
        'department__name',  # Updated for ForeignKey 
        'job_title',
        'employment_status',
        'date_of_joining',
        'employment_type',
        'created_at'
    ]
    ordering = ['employee_id']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return CreateEmployeeSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateEmployeeSerializer
        return EmployeeSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsHROrSystemAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Create new employee with user account."""
        from settings.models import Department, Location
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create user first
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            password='TempPassword123!'  # TODO: Send password reset link to user
        )

        # Resolve department and location from IDs
        department = None
        location = None
        dept_id = serializer.validated_data.get('department_id')
        loc_id = serializer.validated_data.get('location_id')
        
        if dept_id:
            try:
                department = Department.objects.get(id=dept_id)
            except Department.DoesNotExist:
                pass
        
        if loc_id:
            try:
                location = Location.objects.get(id=loc_id)
            except Location.DoesNotExist:
                pass

        # Exclude ForeignKey ID fields and user fields from remaining data
        excluded_fields = [
            'email', 'first_name', 'last_name', 'employee_id', 
            'job_title', 'department_id', 'location_id', 'employment_type', 'date_of_joining'
        ]
        remaining_data = {k: v for k, v in serializer.validated_data.items() if k not in excluded_fields}

        # Create employee
        employee = Employee.objects.create(
            user=user,
            employee_id=serializer.validated_data['employee_id'],
            job_title=serializer.validated_data['job_title'],
            department=department,
            location=location,
            employment_type=serializer.validated_data['employment_type'],
            date_of_joining=serializer.validated_data['date_of_joining'],
            **remaining_data
        )

        # Log audit trail
        AuditTrailMixin.log_create(request.user, employee, request)

        response_serializer = EmployeeSerializer(employee)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update employee with audit trail."""
        instance = self.get_object()
        
        # Store original values for audit (handle ForeignKey relationships)
        original_values = {}
        for field in ['middle_name', 'personal_email', 'phone_number', 'gender',
                     'address', 'date_of_birth', 'nationality', 'employment_status',
                     'job_title', 'probation_policy', 'shift', 'employment_type',
                     'contract_end_date', 'contractor_company', 'termination_date',
                     'termination_reason']:
            original_values[field] = getattr(instance, field, None)
        # Store ForeignKey IDs for audit
        original_values['department_id'] = instance.department_id
        original_values['location_id'] = instance.location_id

        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Log audit trail
        AuditTrailMixin.log_update(request.user, instance, original_values, request)

        # Return full employee data with nested objects
        response_serializer = EmployeeSerializer(instance)
        return Response(response_serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's employee profile."""
        try:
            employee = request.user.employee
            serializer = self.get_serializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsHROrSystemAdmin])
    def upload_document(self, request, pk=None):
        """Upload document for employee."""
        employee = self.get_object()
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        document = EmployeeDocument.objects.create(
            employee=employee,
            name=request.data.get('name', request.FILES['file'].name),
            document_type=request.data.get('document_type', 'other'),
            file=request.FILES['file'],
            uploaded_by=request.user
        )

        serializer = EmployeeDocumentSerializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for an employee."""
        employee = self.get_object()
        documents = employee.documents.all()
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsHROrSystemAdmin])
    def delete_document(self, request, pk=None):
        """Delete a document."""
        employee = self.get_object()
        doc_id = request.query_params.get('doc_id')
        
        if not doc_id:
            return Response({'error': 'doc_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            document = employee.documents.get(id=doc_id)
            document.soft_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except EmployeeDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

