"""
Project URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectAssignmentViewSet

router = DefaultRouter()
router.register('', ProjectViewSet, basename='project')
router.register('assignments', ProjectAssignmentViewSet, basename='project-assignment')

urlpatterns = [
    path('', include(router.urls)),
]



