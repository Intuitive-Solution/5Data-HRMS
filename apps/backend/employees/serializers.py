"""
Employee serializers.
"""
from rest_framework import serializers
from .models import Employee
from accounts.serializers import UserSerializer


class EmployeeSerializer(serializers.ModelSerializer):
    """Employee serializer."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = (
            'id', 'user', 'employee_id', 'department', 'job_role',
            'employment_type', 'date_of_joining', 'contract_end_date',
            'reporting_manager', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class CreateEmployeeSerializer(serializers.Serializer):
    """Create employee serializer."""
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    employee_id = serializers.CharField(max_length=50)
    department = serializers.CharField(max_length=100)
    job_role = serializers.CharField(max_length=100)
    employment_type = serializers.ChoiceField(
        choices=['full_time', 'contract', 'part_time', 'intern']
    )
    date_of_joining = serializers.DateField()
    contract_end_date = serializers.DateField(required=False, allow_null=True)
    reporting_manager_id = serializers.IntegerField(required=False, allow_null=True)

