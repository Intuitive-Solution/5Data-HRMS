"""
Authentication views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from common.utils import log_audit_action
from common.permissions import IsSystemAdmin, IsHROrSystemAdmin
from .models import Role, UserRole
from .serializers import (
    LoginSerializer,
    LoginResponseSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    UserSerializer,
    RoleSerializer,
    UserRoleSerializer,
)

User = get_user_model()


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints."""

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Login endpoint."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        # Log audit action
        log_audit_action(
            user=user,
            action='LOGIN',
            entity='User',
            entity_id=str(user.id),
            request=request
        )

        response_data = {
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': UserSerializer(user, context={'request': request}).data,
        }

        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout endpoint."""
        log_audit_action(
            user=request.user,
            action='LOGOUT',
            entity='User',
            entity_id=str(request.user.id),
            request=request
        )

        return Response(
            {'detail': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def refresh(self, request):
        """Refresh JWT token."""
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh = RefreshToken(serializer.validated_data['refresh'])
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': 'Invalid refresh token'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change password endpoint."""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'detail': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        log_audit_action(
            user=user,
            action='PASSWORD_CHANGED',
            entity='User',
            entity_id=str(user.id),
            request=request
        )

        return Response(
            {'detail': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user."""
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """Role viewset - list and retrieve roles."""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class UserRoleViewSet(viewsets.ViewSet):
    """User role management viewset."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsSystemAdmin])
    def list_roles(self, request):
        """List all available roles."""
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsHROrSystemAdmin])
    def assign_role(self, request):
        """Assign a role to a user."""
        user_id = request.data.get('user_id')
        role_name = request.data.get('role_name')

        if not user_id or not role_name:
            return Response(
                {'detail': 'user_id and role_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, name=role_name)

        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
            defaults={'assigned_by': request.user}
        )

        if not created:
            return Response(
                {'detail': 'User already has this role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserRoleSerializer(user_role)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsHROrSystemAdmin])
    def remove_role(self, request):
        """Remove a role from a user."""
        user_id = request.data.get('user_id')
        role_name = request.data.get('role_name')

        if not user_id or not role_name:
            return Response(
                {'detail': 'user_id and role_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, name=role_name)

        user_role = get_object_or_404(UserRole, user=user, role=role)
        user_role.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def user_roles(self, request):
        """Get roles for a specific user."""
        user_id = request.query_params.get('user_id')

        if not user_id:
            user_id = request.user.id

        user = get_object_or_404(User, id=user_id)
        user_roles = UserRole.objects.filter(user=user)
        serializer = UserRoleSerializer(user_roles, many=True)
        return Response(serializer.data)

