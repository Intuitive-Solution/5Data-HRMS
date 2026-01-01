"""
Settings URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, LocationViewSet, HolidayViewSet

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('locations', LocationViewSet, basename='location')
router.register('holidays', HolidayViewSet, basename='holiday')

urlpatterns = [
    path('', include(router.urls)),
]

