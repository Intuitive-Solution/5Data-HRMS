"""
Tests for Role-Based Access Control system.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Role, UserRole

User = get_user_model()


class RoleModelTests(TestCase):
    """Tests for Role model."""

    def setUp(self):
        """Set up test data."""
        self.roles = Role.objects.all()

    def test_all_roles_exist(self):
        """Test that all 7 roles are created."""
        self.assertEqual(self.roles.count(), 7)

    def test_role_names(self):
        """Test that all required role names exist."""
        role_names = set(self.roles.values_list('name', flat=True))
        expected_roles = {
            'employee',
            'reporting_manager',
            'project_lead',
            'project_manager',
            'hr_user',
            'finance_user',
            'system_admin',
        }
        self.assertEqual(role_names, expected_roles)

    def test_role_display_names(self):
        """Test that roles have display names."""
        for role in self.roles:
            self.assertIsNotNone(role.display_name)
            self.assertTrue(len(role.display_name) > 0)


class UserRoleTests(TestCase):
    """Tests for User-Role relationship."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.hr_role = Role.objects.get(name='hr_user')
        self.admin_role = Role.objects.get(name='system_admin')

    def test_has_role_true(self):
        """Test has_role returns True when user has role."""
        UserRole.objects.create(user=self.user, role=self.hr_role)
        self.assertTrue(self.user.has_role('hr_user'))

    def test_has_role_false(self):
        """Test has_role returns False when user doesn't have role."""
        self.assertFalse(self.user.has_role('system_admin'))

    def test_get_role_names_single_role(self):
        """Test get_role_names with single role."""
        UserRole.objects.create(user=self.user, role=self.hr_role)
        roles = self.user.get_role_names()
        self.assertEqual(roles, ['hr_user'])

    def test_get_role_names_multiple_roles(self):
        """Test get_role_names with multiple roles."""
        UserRole.objects.create(user=self.user, role=self.hr_role)
        UserRole.objects.create(user=self.user, role=self.admin_role)
        roles = self.user.get_role_names()
        self.assertEqual(set(roles), {'hr_user', 'system_admin'})

    def test_get_role_names_no_roles(self):
        """Test get_role_names with no roles."""
        roles = self.user.get_role_names()
        self.assertEqual(roles, [])

    def test_unique_user_role_constraint(self):
        """Test that user can't have same role twice."""
        UserRole.objects.create(user=self.user, role=self.hr_role)
        # Attempting to create duplicate should raise IntegrityError
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            UserRole.objects.create(user=self.user, role=self.hr_role)

    def test_user_role_assignment_tracking(self):
        """Test that assigned_at and assigned_by are tracked."""
        admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        user_role = UserRole.objects.create(
            user=self.user,
            role=self.hr_role,
            assigned_by=admin_user
        )
        self.assertIsNotNone(user_role.assigned_at)
        self.assertEqual(user_role.assigned_by, admin_user)


class PermissionClassTests(TestCase):
    """Tests for permission classes."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            is_active=True
        )
        self.admin_role = Role.objects.get(name='system_admin')
        self.hr_role = Role.objects.get(name='hr_user')

    def test_is_system_admin_permission_granted(self):
        """Test IsSystemAdmin permission is granted for admin role."""
        from common.permissions import IsSystemAdmin
        UserRole.objects.create(user=self.user, role=self.admin_role)
        
        permission = IsSystemAdmin()
        mock_request = type('Request', (), {'user': self.user})()
        self.assertTrue(permission.has_permission(mock_request, None))

    def test_is_system_admin_permission_denied(self):
        """Test IsSystemAdmin permission is denied without admin role."""
        from common.permissions import IsSystemAdmin
        permission = IsSystemAdmin()
        mock_request = type('Request', (), {'user': self.user})()
        self.assertFalse(permission.has_permission(mock_request, None))

    def test_is_hr_permission_granted(self):
        """Test IsHR permission is granted for hr role."""
        from common.permissions import IsHR
        UserRole.objects.create(user=self.user, role=self.hr_role)
        
        permission = IsHR()
        mock_request = type('Request', (), {'user': self.user})()
        self.assertTrue(permission.has_permission(mock_request, None))

    def test_is_hr_or_system_admin_either_role(self):
        """Test IsHROrSystemAdmin with either role."""
        from common.permissions import IsHROrSystemAdmin
        
        # Test with HR role
        UserRole.objects.create(user=self.user, role=self.hr_role)
        permission = IsHROrSystemAdmin()
        mock_request = type('Request', (), {'user': self.user})()
        self.assertTrue(permission.has_permission(mock_request, None))


class RoleAPITests(APITestCase):
    """Tests for role API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        self.admin_role = Role.objects.get(name='system_admin')
        UserRole.objects.create(user=self.admin_user, role=self.admin_role)

    def test_list_roles_unauthenticated(self):
        """Test that unauthenticated users can't list roles."""
        response = self.client.get('/api/v1/auth/roles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_roles_authenticated(self):
        """Test that authenticated users can list roles."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 7)

    def test_me_endpoint_includes_roles(self):
        """Test that /me endpoint includes user roles."""
        hr_role = Role.objects.get(name='hr_user')
        UserRole.objects.create(user=self.user, role=hr_role)
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['roles'], ['hr_user'])


class AdminInterfaceTests(TestCase):
    """Tests for Django admin integration."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.admin_role = Role.objects.get(name='system_admin')
        UserRole.objects.create(user=self.user, role=self.admin_role)

    def test_role_model_registered(self):
        """Test that Role model is registered in admin."""
        from django.contrib.admin.sites import AdminSite
        from accounts.admin import RoleAdmin
        
        admin_site = AdminSite()
        role_admin = RoleAdmin(Role, admin_site)
        self.assertIsNotNone(role_admin)

    def test_user_role_model_registered(self):
        """Test that UserRole model is registered in admin."""
        from django.contrib.admin.sites import AdminSite
        from accounts.admin import UserRoleAdmin
        
        admin_site = AdminSite()
        user_role_admin = UserRoleAdmin(UserRole, admin_site)
        self.assertIsNotNone(user_role_admin)

    def test_user_admin_has_roles_display(self):
        """Test that User admin shows roles."""
        from django.contrib.admin.sites import AdminSite
        from accounts.admin import CustomUserAdmin
        
        admin_site = AdminSite()
        user_admin = CustomUserAdmin(User, admin_site)
        
        # Check that get_roles method exists
        self.assertTrue(hasattr(user_admin, 'get_roles'))
        
        # Test the method
        roles_display = user_admin.get_roles(self.user)
        self.assertEqual(roles_display, 'System Admin')



