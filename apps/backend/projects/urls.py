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
)

urlpatterns = [
    # Project endpoints
    path('', ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/assignments/', ProjectAssignmentsView.as_view(), name='project-assignments'),
    
    # Assignment endpoints
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
]



