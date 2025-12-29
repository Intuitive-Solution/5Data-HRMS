# RBAC Quick Reference Guide

## Overview
The HRMS application now uses a comprehensive Role-Based Access Control (RBAC) system with 7 distinct roles instead of a simple `is_staff` flag.

## Available Roles

| Role | Value | Description |
|------|-------|-------------|
| Employee | `employee` | Basic employee access |
| Reporting Manager | `reporting_manager` | Manages team members |
| Project Lead | `project_lead` | Leads project teams |
| Project Manager | `project_manager` | Manages projects |
| HR User | `hr_user` | HR department access |
| Finance User | `finance_user` | Finance department access |
| System Admin | `system_admin` | Full system access |

## Backend Usage

### Check User Roles in Views
```python
from rest_framework.response import Response
from common.permissions import IsHROrSystemAdmin, IsSystemAdmin

class MyViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAuthenticated(), IsHROrSystemAdmin()]
        return [IsAuthenticated()]
```

### Check User Roles in Logic
```python
if request.user.has_role('hr_user'):
    # Do HR-specific logic
    
role_names = request.user.get_role_names()  # ['hr_user', 'system_admin']
```

### Permission Classes Available
- `IsAuthenticated` - User is logged in
- `IsActive` - User is active
- `IsSystemAdmin` - Has system_admin role
- `IsHR` - Has hr_user role
- `IsHROrSystemAdmin` - Has hr_user or system_admin role
- `IsFinance` - Has finance_user role
- `IsProjectManager` - Has project_manager role
- `IsProjectLead` - Has project_lead role
- `IsReportingManager` - Has reporting_manager role

### Legacy Aliases (for backward compatibility)
- `IsAdmin` → `IsSystemAdmin`
- `IsHROrAdmin` → `IsHROrSystemAdmin`

## API Endpoints

### Role Management (all under `/api/v1/auth/`)

#### List all roles
```
GET /api/v1/auth/roles/
Authorization: Bearer {token}
```

#### Get user's roles
```
GET /api/v1/auth/user-roles/user_roles/?user_id=5
Authorization: Bearer {token}

# Current user's roles (default)
GET /api/v1/auth/user-roles/user_roles/
Authorization: Bearer {token}
```

#### Assign role to user
```
POST /api/v1/auth/user-roles/assign_role/
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "role_name": "hr_user"
}
```

#### Remove role from user
```
POST /api/v1/auth/user-roles/remove_role/
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "role_name": "hr_user"
}
```

#### Get current user (includes roles)
```
POST /api/v1/auth/me/
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "roles": ["hr_user", "system_admin"]
}
```

## Frontend Usage

### Hook-based Checks
```typescript
import { useHasRole, useIsAdmin, useIsHROrAdmin } from '../hooks/useAuth'

function MyComponent() {
  const isAdmin = useIsAdmin()
  const hasHRRole = useHasRole('hr_user')
  const isManagement = useHasAnyRole(['project_manager', 'reporting_manager'])
  
  return (
    <>
      {isAdmin && <AdminPanel />}
      {hasHRRole && <HRSection />}
    </>
  )
}
```

### Protected Routes
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute'

<ProtectedRoute requiredRoles={['hr_user', 'system_admin']}>
  <EmployeeManagementPage />
</ProtectedRoute>
```

### Available Hooks
- `useAuth()` - Get full auth state
- `useHasRole(role)` - Check single role
- `useHasAnyRole(roles)` - Check if user has any of the roles
- `useHasAllRoles(roles)` - Check if user has all roles
- `useIsAdmin()` - Check if system admin
- `useIsHROrAdmin()` - Check if HR or admin
- `useIsAuthenticated()` - Check if logged in

## Django Admin

### User Management
- Users are displayed with their roles in a new "Roles" column
- Inline UserRole form for easy role assignment
- View role assignment history (assigned_at, assigned_by)

### Role Management
- Create/edit/delete roles
- View role descriptions
- See all users with a specific role

### UserRole Assignment
- Dedicated admin page for role assignments
- Shows who assigned the role and when
- Track assignment history

## Testing

### Create Test User with Roles
```bash
python manage.py shell << EOF
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User'
)

hr_role = Role.objects.get(name='hr_user')
UserRole.objects.create(user=user, role=hr_role)
EOF
```

### Test API Authentication
```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  | jq -r '.tokens.access')

# Use token to access protected endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/auth/me/
```

## Common Tasks

### Assign HR Role to User
```bash
curl -X POST http://localhost:8000/api/v1/auth/user-roles/assign_role/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 5, "role_name": "hr_user"}'
```

### Migrate Existing Staff Users
```bash
python manage.py shell << EOF
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
admin_role = Role.objects.get(name='system_admin')

for user in User.objects.filter(is_staff=True):
    UserRole.objects.get_or_create(
        user=user,
        role=admin_role,
        defaults={'assigned_by': None}
    )
    print(f"Assigned admin role to {user.email}")
EOF
```

### Check User's Roles via Django Shell
```bash
python manage.py shell << EOF
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='user@example.com')
print(f"Roles: {user.get_role_names()}")
print(f"Is Admin: {user.has_role('system_admin')}")
print(f"Is HR: {user.has_role('hr_user')}")
EOF
```

## Migration Guide

### For Existing Deployments

1. **Backup database** - Before making any changes
2. **Run migrations** - `python manage.py migrate`
3. **Populate roles** - Handled by data migration automatically
4. **Assign roles to users** - Use script above
5. **Test API endpoints** - Verify roles are returned correctly
6. **Update frontend** - Use new hooks and components
7. **Monitor logs** - Check for permission errors

### For New Deployments

Roles are automatically created and available for assignment.

## Troubleshooting

### User Has Roles But API Returns Empty List
1. Clear browser cache
2. Check that UserRole records exist: 
   ```bash
   python manage.py shell << EOF
from accounts.models import UserRole
print(UserRole.objects.filter(user__email='user@example.com'))
   EOF
   ```

### Permission Denied on API Endpoint
1. Check user's roles: `/api/v1/auth/me/`
2. Verify permission class in view
3. Ensure role matches exactly (e.g., 'hr_user' not 'HR User')

### Admin Interface Shows Duplicate Roles
1. Check UserRole model - each user should have unique (user, role) pairs
2. Django enforces this in the model definition

## Best Practices

1. ✅ Always check permissions on backend (frontend is for UX only)
2. ✅ Use permission classes on viewsets
3. ✅ Log who assigns roles using `assigned_by` field
4. ✅ Users can have multiple roles
5. ✅ Use exact role names from `ROLE_CHOICES`
6. ✅ Provide graceful degradation for missing permissions

## Next Steps (Future Enhancements)

- [ ] Fine-grained permissions per role
- [ ] Project-scoped role assignments
- [ ] Time-limited role assignments
- [ ] Custom role creation via admin
- [ ] Role inheritance/hierarchies

---

For detailed documentation, see [RBAC_IMPLEMENTATION.md](docs/RBAC_IMPLEMENTATION.md)



