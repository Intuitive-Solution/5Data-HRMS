"""
Project serializers.
"""
from rest_framework import serializers
from .models import Project, ProjectAssignment


class ProjectSerializer(serializers.ModelSerializer):
    """Project serializer."""
    class Meta:
        model = Project
        fields = (
            'id', 'name', 'client', 'billing_type', 'start_date',
            'end_date', 'status', 'description', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    """Project assignment serializer."""
    class Meta:
        model = ProjectAssignment
        fields = (
            'id', 'employee', 'project', 'role', 'assigned_date',
            'unassigned_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')



