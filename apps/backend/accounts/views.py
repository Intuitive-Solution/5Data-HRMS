"""
Authentication views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from common.utils import log_audit_action
from .serializers import (
    LoginSerializer,
    LoginResponseSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    UserSerializer,
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
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

