# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the implementation of a proper Role-Based Access Control system in the 5Data HRMS application. The system has moved away from a simple `is_staff` flag-based authorization to a comprehensive role management system with seven distinct roles.

## Architecture

### Database Schema

The RBAC system uses three main models:

```
User (AbstractUser)
├── id (PK)
├── email (unique)
├── first_name
├── last_name
├── is_active
├── is_staff (legacy, for Django admin)
├── is_superuser (legacy, for Django admin)
└── roles (FK to UserRole via OneToMany)

Role
├── id (PK)
├── name (unique, choices: 'employee', 'reporting_manager', 'project_lead', 'project_manager', 'hr_user', 'finance_user', 'system_admin')
├── display_name
├── description
├── created_at
└── updated_at

UserRole (Junction Table)
├── id (PK)
├── user_id (FK)
├── role_id (FK)
├── assigned_at (auto_now_add)
├── assigned_by_id (FK, nullable)
└── unique_together (user, role)
```

### Roles

The system defines 7 roles:

| Role | Name | Description |
|------|------|-------------|
| Employee | `employee` | Regular employee with basic access |
| Reporting Manager | `reporting_manager` | Manager responsible for team members |
| Project Lead | `project_lead` | Lead of a project team |
| Project Manager | `project_manager` | Manager of project operations and resources |
| HR User | `hr_user` | Human Resources user with HR access |
| Finance User | `finance_user` | Finance user with financial data access |
| System Admin | `system_admin` | System administrator with full access |

## Backend Implementation

### 1. User Model Methods

The `User` model includes two helper methods:

```python
def has_role(self, role_name):
    """Check if user has a specific role."""
    return self.roles.filter(role__name=role_name).exists()

def get_role_names(self):
    """Get list of all role names for this user."""
    return list(self.roles.values_list('role__name', flat=True))
```

### 2. Permission Classes

Role-based permission classes are defined in `common/permissions.py`:

- `IsSystemAdmin` - Requires system_admin role
- `IsHR` - Requires hr_user role
- `IsHROrSystemAdmin` - Requires hr_user or system_admin role
- `IsFinance` - Requires finance_user role
- `IsProjectManager` - Requires project_manager role
- `IsProjectLead` - Requires project_lead role
- `IsReportingManager` - Requires reporting_manager role

Legacy aliases are provided for backward compatibility:
- `IsAdmin` → `IsSystemAdmin`
- `IsHROrAdmin` → `IsHROrSystemAdmin`

### 3. API Endpoints

#### Role Management Endpoints

- `GET /api/accounts/roles/` - List all available roles (authenticated users)
- `GET /api/accounts/user-roles/list_roles/` - List all roles (system admin only)
- `GET /api/accounts/user-roles/user_roles/` - Get roles for a specific user
- `POST /api/accounts/user-roles/assign_role/` - Assign role to user (HR or admin)
- `POST /api/accounts/user-roles/remove_role/` - Remove role from user (HR or admin)

#### Request/Response Examples

**Assign Role:**
```bash
POST /api/accounts/user-roles/assign_role/
Content-Type: application/json

{
  "user_id": 5,
  "role_name": "hr_user"
}

Response (201):
{
  "id": 12,
  "role": 5,
  "role_name": "hr_user",
  "role_display_name": "HR User",
  "assigned_at": "2025-12-28T10:30:45.123Z",
  "assigned_by_email": "admin@example.com"
}
```

**Get User Roles:**
```bash
GET /api/accounts/user-roles/user_roles/?user_id=5

Response (200):
[
  {
    "id": 12,
    "role": 5,
    "role_name": "hr_user",
    "role_display_name": "HR User",
    "assigned_at": "2025-12-28T10:30:45.123Z",
    "assigned_by_email": "admin@example.com"
  }
]
```

### 4. Admin Interface

The Django admin interface includes:

- **Role Admin** - Manage roles (display_name, description)
- **User Admin** - Enhanced with:
  - UserRole inline for easy role assignment
  - `get_roles()` column showing user's roles
- **UserRole Admin** - Manage role assignments with audit trail (assigned_by, assigned_at)

## Frontend Implementation

### 1. Authentication Hooks

File: `src/hooks/useAuth.ts`

```typescript
// Check if user has specific role
const isAdmin = useHasRole('system_admin')

// Check if user has any of specified roles
const isManagement = useHasAnyRole(['reporting_manager', 'project_manager'])

// Check if user has all specified roles
const isSupervisor = useHasAllRoles(['project_manager', 'reporting_manager'])

// Check specific combinations
const isHROrAdmin = useIsHROrAdmin()
const isAdmin = useIsAdmin()
const isAuthenticated = useIsAuthenticated()
```

### 2. Protected Routes

File: `src/components/ProtectedRoute.tsx`

```typescript
// Basic protection
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requiredRoles={['hr_user', 'system_admin']}>
  <EmployeeManagementPage />
</ProtectedRoute>

// Custom fallback
<ProtectedRoute 
  requiredRoles={['system_admin']}
  fallback={<AccessDeniedPage />}
>
  <AdminPanel />
</ProtectedRoute>
```

### 3. Conditional Rendering

```typescript
import { useHasRole } from '../hooks/useAuth'

function EmployeeActions() {
  const canManageEmployees = useHasRole('hr_user')
  
  return (
    <>
      {canManageEmployees && (
        <button onClick={handleCreate}>Create Employee</button>
      )}
    </>
  )
}
```

## Migration Path

### Phase 1: Initial Deployment (Completed)
1. Create Role and UserRole models
2. Populate default roles via data migration
3. Update permission classes to use roles
4. Update serializers to return user roles

### Phase 2: Data Population
1. Run script to assign roles to existing users based on `is_staff` flag
   - `is_staff=True` users get `system_admin` role
   - `is_superuser=True` users get `system_admin` role

### Phase 3: Frontend Updates
1. Update all permission checks to use role-based logic
2. Add role-based UI components
3. Remove `is_staff` checks from frontend

### Phase 4: Cleanup
1. Consider deprecating `is_staff` field (keep for Django admin compatibility)
2. Document legacy permission checks

## Migration Script for Existing Users

To migrate existing staff users to the new role system:

```bash
cd apps/backend
source venv/bin/activate
python manage.py shell << EOF
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
admin_role = Role.objects.get(name='system_admin')

# Assign system_admin role to staff users
for user in User.objects.filter(is_staff=True):
    UserRole.objects.get_or_create(
        user=user,
        role=admin_role,
        defaults={'assigned_by': None}
    )
    print(f"Assigned system_admin role to {user.email}")
EOF
```

## API Usage Examples

### Using curl

```bash
# Get current user (includes roles)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/accounts/me/

# Assign HR role to user
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 5, "role_name": "hr_user"}' \
  http://localhost:8000/api/accounts/user-roles/assign_role/

# Get user's roles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/accounts/user-roles/user_roles/?user_id=5
```

## Testing

### Backend Tests

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()

class RoleTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.hr_role = Role.objects.get(name='hr_user')
    
    def test_has_role(self):
        UserRole.objects.create(user=self.user, role=self.hr_role)
        self.assertTrue(self.user.has_role('hr_user'))
        self.assertFalse(self.user.has_role('system_admin'))
    
    def test_get_role_names(self):
        UserRole.objects.create(user=self.user, role=self.hr_role)
        self.assertEqual(self.user.get_role_names(), ['hr_user'])
```

### Frontend Tests

```typescript
import { useHasRole } from '../hooks/useAuth'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'

test('useHasRole returns true if user has role', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  
  const { result } = renderHook(() => useHasRole('hr_user'), { wrapper })
  expect(result.current).toBe(true)
})
```

## Best Practices

1. **Always check roles on the backend** - Never rely on frontend role checks for security
2. **Use permission classes** - Apply permission classes to view methods
3. **Audit trail** - Track who assigned which role via the `assigned_by` field
4. **Multiple roles** - Users can have multiple roles; check permissions appropriately
5. **Consistent naming** - Use role names from the `ROLE_CHOICES` constant
6. **Graceful degradation** - Always provide fallback UI for users without required roles

## Troubleshooting

### User roles not appearing in `/me` endpoint

1. Check if user has any UserRole records:
   ```bash
   python manage.py shell -c "from accounts.models import UserRole; print(UserRole.objects.filter(user_id=5))"
   ```

2. Verify Role objects exist:
   ```bash
   python manage.py shell -c "from accounts.models import Role; print(Role.objects.all().count())"
   ```

### Permission denied errors

1. Check user's roles:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/accounts/me/
   ```

2. Verify endpoint permissions in view:
   ```python
   permission_classes = [IsAuthenticated, IsHROrSystemAdmin]
   ```

## Future Enhancements

1. **Permission-based model** - Add granular permissions tied to roles
2. **Project-scoped roles** - Implement context-aware role assignment per project
3. **Dynamic role creation** - Allow admins to create custom roles via UI
4. **Role inheritance** - Implement role hierarchies (e.g., admin inherits all permissions)
5. **Time-limited roles** - Support temporary role assignments with expiration



