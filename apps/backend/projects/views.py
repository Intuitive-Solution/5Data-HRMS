"""
Project views.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_assigned_projects(request):
    """Get current user's assigned projects."""
    try:
        employee = request.user.employee
        # Get all assignments for this employee (regardless of status)
        # A user can still add timesheets for projects they were assigned to
        assignments = ProjectAssignment.objects.filter(
            employee=employee
        ).select_related('project').order_by('project_id').distinct('project_id')
        
        # Get unique projects from assignments
        project_ids = set()
        projects = []
        for assignment in assignments:
            if assignment.project_id not in project_ids:
                project_ids.add(assignment.project_id)
                projects.append(assignment.project)
        
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


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



