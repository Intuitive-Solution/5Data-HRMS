"""
Authentication serializers.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active')
        read_only_fields = ('id',)


class LoginSerializer(serializers.Serializer):
    """Login serializer."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')

        if not user.is_active:
            raise serializers.ValidationError('User account is inactive.')

        data['user'] = user
        return data


class LoginResponseSerializer(serializers.Serializer):
    """Login response serializer."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class RefreshTokenSerializer(serializers.Serializer):
    """Refresh token serializer."""
    refresh = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError('Passwords do not match.')
        return data

