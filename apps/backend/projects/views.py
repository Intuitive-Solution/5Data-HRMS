"""
Project views.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Project, ProjectAssignment
from .serializers import ProjectSerializer, ProjectAssignmentSerializer


class ProjectListCreateView(generics.ListCreateAPIView):
    """List all projects or create a new project."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'client']
    ordering_fields = ['start_date', 'created_at', 'name', 'status']
    filterset_fields = ['status']


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a project."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


class ProjectAssignmentsView(APIView):
    """Get all assignments for a specific project."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        assignments = ProjectAssignment.objects.filter(project=project)
        serializer = ProjectAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class AssignmentListCreateView(generics.ListCreateAPIView):
    """List all assignments or create a new assignment."""
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['employee__employee_id', 'project__name']
    ordering_fields = ['assigned_date', 'created_at']
    filterset_fields = ['project', 'employee']


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an assignment."""
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]



