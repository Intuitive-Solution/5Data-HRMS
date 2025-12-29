"""
User and authentication models.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model."""
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.email

    def has_role(self, role_name):
        """Check if user has a specific role."""
        return self.roles.filter(role__name=role_name).exists()

    def get_role_names(self):
        """Get list of all role names for this user."""
        return list(self.roles.values_list('role__name', flat=True))


class Role(models.Model):
    """Role model for RBAC system."""
    ROLE_CHOICES = (
        ('employee', 'Employee'),
        ('reporting_manager', 'Reporting Manager'),
        ('project_lead', 'Project Lead'),
        ('project_manager', 'Project Manager'),
        ('hr_user', 'HR User'),
        ('finance_user', 'Finance User'),
        ('system_admin', 'System Admin'),
    )

    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.display_name


class UserRole(models.Model):
    """Junction table for User-Role many-to-many relationship with audit fields."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='users')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_roles'
    )

    class Meta:
        unique_together = ('user', 'role')
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.role.display_name}'

