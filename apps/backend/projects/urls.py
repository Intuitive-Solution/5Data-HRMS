"""
Project URLs.
"""
from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectAssignmentsView,
    AssignmentListCreateView,
    AssignmentDetailView,
    my_assigned_projects,
)

urlpatterns = [
    # Project endpoints
    path('', ProjectListCreateView.as_view(), name='project-list'),
    path('my_projects/', my_assigned_projects, name='my-assigned-projects'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/assignments/', ProjectAssignmentsView.as_view(), name='project-assignments'),
    
    # Assignment endpoints
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
]



