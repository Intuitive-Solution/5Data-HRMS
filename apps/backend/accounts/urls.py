"""
Auth URLs.
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, RoleViewSet, UserRoleViewSet

router = DefaultRouter()
router.register('', AuthViewSet, basename='auth')
router.register('roles', RoleViewSet, basename='role')
router.register('user-roles', UserRoleViewSet, basename='user-role')

urlpatterns = router.urls

