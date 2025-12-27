"""
Project views.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project, ProjectAssignment
from .serializers import ProjectSerializer, ProjectAssignmentSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """Project viewset."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'client']
    ordering_fields = ['start_date', 'created_at']


class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    """Project assignment viewset."""
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee__employee_id', 'project__name']

