"""
Common test utilities.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseTestCase(TestCase):
    """Base test case with common setup."""

    def setUp(self):
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def tearDown(self):
        """Clean up after tests."""
        User.objects.all().delete()

