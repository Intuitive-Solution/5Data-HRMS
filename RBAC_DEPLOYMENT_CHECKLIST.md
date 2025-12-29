# RBAC Deployment Checklist

## Pre-Deployment

- [ ] Read `docs/RBAC_IMPLEMENTATION.md` for full technical details
- [ ] Read `RBAC_QUICK_REFERENCE.md` for quick API reference
- [ ] Review `RBAC_IMPLEMENTATION_SUMMARY.md` for change overview
- [ ] Backup production database
- [ ] Review all modified files
- [ ] Test in staging environment

## Database Migration

- [ ] Stop application servers
- [ ] Create database backup: `python manage.py dumpdata > backup.json`
- [ ] Run migrations: `python manage.py migrate`
  - This will create Role and UserRole models
  - This will populate 7 default roles automatically
- [ ] Verify migrations: `python manage.py migrate --check`

## Data Migration (for existing users)

- [ ] Decide on strategy for migrating `is_staff` users to new role system
  - **Option A:** Assign `system_admin` role to all `is_staff=True` users
  - **Option B:** Manually assign roles during deployment

### Option A - Automated Migration

```bash
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
admin_role = Role.objects.get(name='system_admin')
count = 0

for user in User.objects.filter(is_staff=True):
    UserRole.objects.get_or_create(
        user=user,
        role=admin_role,
        defaults={'assigned_by': None}
    )
    count += 1
    print(f"✓ Assigned system_admin role to {user.email}")

print(f"\nTotal users migrated: {count}")
EOF
```

### Option B - Manual Assignment

1. Access Django admin at `/admin/accounts/user/`
2. For each user, open their profile
3. Use the UserRole inline form to assign roles
4. Save changes

## Backend Testing

- [ ] Run Django system checks: `python manage.py check`
- [ ] Run migrations check: `python manage.py migrate --check`
- [ ] Verify Role model: 7 roles created
  ```bash
  python manage.py shell -c \
    "from accounts.models import Role; print(f'Roles: {Role.objects.count()}')"
  ```
- [ ] Test User helper methods
  ```bash
  python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.first()
print(f"User: {user.email}")
print(f"Roles: {user.get_role_names()}")
EOF
  ```

## API Testing

- [ ] Test login endpoint still works
- [ ] Test `/api/v1/auth/me/` returns roles
- [ ] Test `/api/v1/auth/roles/` requires authentication
- [ ] Test role assignment endpoints (requires HR or admin)
- [ ] Test permission checks on protected endpoints

Example test:
```bash
# Login
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.tokens.access')

# Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/auth/me/ | jq '.roles'
```

## Admin Interface Testing

- [ ] Access Django admin at `/admin/`
- [ ] View Role list at `/admin/accounts/role/`
  - Verify 7 roles are present
  - Verify display names and descriptions
- [ ] View User list at `/admin/accounts/user/`
  - Verify "Roles" column is visible
  - Click on a user to edit
  - Verify UserRole inline form is present
- [ ] View UserRole list at `/admin/accounts/userrole/`
  - Create a new assignment
  - Verify audit trail fields (assigned_at, assigned_by)

## Frontend Testing

- [ ] Import and test auth hooks
  ```typescript
  import { useHasRole, useIsAdmin } from '../hooks/useAuth'
  const isAdmin = useIsAdmin()
  ```
- [ ] Test ProtectedRoute component
  ```typescript
  import { ProtectedRoute } from '../components/ProtectedRoute'
  <ProtectedRoute requiredRoles={['hr_user']}>
    <AdminPanel />
  </ProtectedRoute>
  ```
- [ ] Test conditional rendering based on roles
- [ ] Verify UI elements show/hide based on roles

## Permission Testing

- [ ] Test endpoint with HR permission
  - User without hr_user role gets 403
  - User with hr_user role gets access
- [ ] Test endpoint with System Admin permission
  - User without system_admin role gets 403
  - User with system_admin role gets access
- [ ] Test endpoints with multiple role requirements
  - Verify OR logic works correctly
  - Verify permission denial is graceful

## Monitoring & Logging

- [ ] Check application logs for errors
- [ ] Verify no 500 errors on API endpoints
- [ ] Check database logs for any issues
- [ ] Monitor resource usage
- [ ] Verify audit trail is being recorded

### Log Check
```bash
# Check Django logs
tail -f /var/log/django/error.log

# Check for permission errors
grep -i "permission\|forbidden" /var/log/django/error.log
```

## Documentation

- [ ] Update team documentation with new roles
- [ ] Add RBAC training to onboarding
- [ ] Document role assignment process
- [ ] Create runbook for common tasks:
  - How to assign a role
  - How to remove a role
  - How to check user roles
- [ ] Update API documentation

## Communication

- [ ] Notify team of new role system
- [ ] Explain how to use new permission classes
- [ ] Provide migration guide for existing code
- [ ] Share documentation links
- [ ] Schedule training session if needed

## Post-Deployment Validation

- [ ] Monitor error logs for 24 hours
- [ ] Test all API endpoints
- [ ] Verify permission checks are working
- [ ] Test admin interface thoroughly
- [ ] Check response times
- [ ] Verify no data loss

## Rollback Plan (if needed)

In case of critical issues:

1. **Immediate Actions:**
   ```bash
   # Revert to previous version
   git revert <commit-hash>
   
   # Rollback database
   python manage.py migrate <app> <previous-migration>
   ```

2. **Restore from backup:**
   ```bash
   python manage.py loaddata backup.json
   ```

3. **Verify rollback:**
   - Test API endpoints
   - Check admin interface
   - Monitor logs

## Post-Deployment Review

After 1 week of deployment:

- [ ] No critical errors in logs
- [ ] All team members trained on new system
- [ ] All API endpoints functioning correctly
- [ ] No performance regressions
- [ ] Role assignments are correct
- [ ] Audit trail is complete

## Sign-Off

- [ ] Development Team: _______________  Date: _______
- [ ] QA Team: _______________  Date: _______
- [ ] DevOps Team: _______________  Date: _______
- [ ] Project Manager: _______________  Date: _______

## Notes

```
[Space for deployment notes and observations]
```

---

## Quick Command Reference

### View Roles
```bash
python manage.py shell -c \
  "from accounts.models import Role; \
   [print(f'{r.name}: {r.display_name}') for r in Role.objects.all()]"
```

### Assign Role to User
```bash
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
user = User.objects.get(email='user@example.com')
role = Role.objects.get(name='hr_user')
UserRole.objects.create(user=user, role=role)
print(f"Assigned {role.display_name} to {user.email}")
EOF
```

### Remove Role from User
```bash
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from accounts.models import Role, UserRole

User = get_user_model()
user = User.objects.get(email='user@example.com')
role = Role.objects.get(name='hr_user')
UserRole.objects.get(user=user, role=role).delete()
print(f"Removed {role.display_name} from {user.email}")
EOF
```

### Check User Roles
```bash
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='user@example.com')
print(f"User: {user.email}")
print(f"Roles: {user.get_role_names()}")
EOF
```

### Verify All Roles Exist
```bash
python manage.py shell << 'EOF'
from accounts.models import Role

expected = 7
actual = Role.objects.count()
print(f"Expected roles: {expected}")
print(f"Actual roles: {actual}")
print(f"Status: {'✓ OK' if expected == actual else '✗ ERROR'}")
EOF
```

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Status:** [ ] Complete  [ ] In Progress  [ ] On Hold



