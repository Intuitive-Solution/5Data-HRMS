"""
User admin configuration.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, UserRole


class UserRoleInline(admin.TabularInline):
    """Inline admin for UserRole."""
    model = UserRole
    extra = 1
    fk_name = 'user'
    fields = ('role', 'assigned_at', 'assigned_by')
    readonly_fields = ('assigned_at',)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """User admin."""
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'get_roles')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')
    inlines = [UserRoleInline]
    
    # Override fieldsets to remove username field
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    def get_roles(self, obj):
        """Display user roles in list view."""
        roles = obj.get_role_names()
        return ', '.join(roles) if roles else '-'
    get_roles.short_description = 'Roles'


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Role admin."""
    list_display = ('display_name', 'name', 'description', 'created_at')
    search_fields = ('name', 'display_name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    fields = ('name', 'display_name', 'description', 'created_at', 'updated_at')


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """UserRole admin."""
    list_display = ('user_email', 'role_name', 'assigned_at', 'assigned_by_email')
    search_fields = ('user__email', 'role__display_name')
    ordering = ('-assigned_at',)
    readonly_fields = ('assigned_at',)
    fields = ('user', 'role', 'assigned_at', 'assigned_by')

    def user_email(self, obj):
        """Display user email in list view."""
        return obj.user.email
    user_email.short_description = 'User Email'

    def role_name(self, obj):
        """Display role display name in list view."""
        return obj.role.display_name
    role_name.short_description = 'Role'

    def assigned_by_email(self, obj):
        """Display assigned by user email in list view."""
        return obj.assigned_by.email if obj.assigned_by else '-'
    assigned_by_email.short_description = 'Assigned By'

