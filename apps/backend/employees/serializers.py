"""
Employee serializers.
"""
from rest_framework import serializers
from .models import Employee, EmployeeDocument
from accounts.serializers import UserSerializer
from settings.serializers import DepartmentSerializer, LocationSerializer


class ReportingManagerSerializer(serializers.ModelSerializer):
    """Serializer for reporting manager info."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = ('id', 'employee_id', 'user', 'job_title')
        read_only_fields = ('id',)


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    """Employee document serializer."""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = EmployeeDocument
        fields = (
            'id', 'name', 'document_type', 'file', 'uploaded_by', 
            'uploaded_by_name', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class EmployeeSerializer(serializers.ModelSerializer):
    """Employee serializer with all fields."""
    user = UserSerializer(read_only=True)
    reporting_manager = ReportingManagerSerializer(read_only=True)
    documents = EmployeeDocumentSerializer(read_only=True, many=True)
    # Nested serializers for department and location (read-only)
    department = DepartmentSerializer(read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = (
            # Basic
            'id', 'user', 'employee_id',
            # Personal Info
            'middle_name', 'personal_email', 'phone_number', 'gender', 
            'address', 'date_of_birth', 'nationality', 'picture',
            'employment_status',
            # Job Info
            'job_title', 'probation_policy', 'reporting_manager',
            # Work Info
            'department', 'location', 'shift', 'employment_type',
            'date_of_joining', 'contract_end_date', 'contractor_company',
            'termination_date', 'termination_reason',
            # Meta
            'documents', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'documents')


class CreateEmployeeSerializer(serializers.Serializer):
    """Create employee serializer."""
    # User fields
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    
    # Personal Info
    employee_id = serializers.CharField(max_length=50)
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    personal_email = serializers.EmailField(required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=['male', 'female', 'other', 'prefer_not_to_say'],
        required=False
    )
    address = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    nationality = serializers.CharField(max_length=100, required=False, allow_blank=True)
    picture = serializers.ImageField(required=False, allow_null=True)
    
    # Job Info
    job_title = serializers.CharField(max_length=100)
    probation_policy = serializers.CharField(max_length=100, required=False, allow_blank=True)
    reporting_manager_id = serializers.IntegerField(required=False, allow_null=True)
    
    # Work Info - now using ForeignKey IDs
    department_id = serializers.IntegerField(required=False, allow_null=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    shift = serializers.CharField(max_length=50, required=False, allow_blank=True)
    employment_type = serializers.ChoiceField(
        choices=['full_time', 'contract', 'part_time', 'intern']
    )
    date_of_joining = serializers.DateField()
    contract_end_date = serializers.DateField(required=False, allow_null=True)
    contractor_company = serializers.CharField(max_length=200, required=False, allow_blank=True)
    termination_date = serializers.DateField(required=False, allow_null=True)
    termination_reason = serializers.CharField(required=False, allow_blank=True)


class UpdateEmployeeSerializer(serializers.ModelSerializer):
    """Update employee serializer."""
    # Accept department_id and location_id for write operations
    department_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    location_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Employee
        fields = (
            # Basic
            'employee_id',
            # Personal Info
            'middle_name', 'personal_email', 'phone_number', 'gender', 
            'address', 'date_of_birth', 'nationality', 'picture',
            'employment_status',
            # Job Info
            'job_title', 'probation_policy', 'reporting_manager',
            # Work Info
            'department_id', 'location_id', 'shift', 'employment_type',
            'contract_end_date', 'contractor_company',
            'termination_date', 'termination_reason'
        )
        read_only_fields = ('user', 'date_of_joining')

    def update(self, instance, validated_data):
        """Handle department_id and location_id for ForeignKey updates."""
        from settings.models import Department, Location
        
        # Handle department_id
        if 'department_id' in validated_data:
            dept_id = validated_data.pop('department_id')
            if dept_id is not None:
                try:
                    instance.department = Department.objects.get(id=dept_id)
                except Department.DoesNotExist:
                    instance.department = None
            else:
                instance.department = None
        
        # Handle location_id
        if 'location_id' in validated_data:
            loc_id = validated_data.pop('location_id')
            if loc_id is not None:
                try:
                    instance.location = Location.objects.get(id=loc_id)
                except Location.DoesNotExist:
                    instance.location = None
            else:
                instance.location = None
        
        return super().update(instance, validated_data)

