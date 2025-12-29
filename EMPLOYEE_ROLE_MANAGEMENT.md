# Employee Role Management Feature

## Overview

The employee role management feature allows you to assign and manage user roles directly from the employee creation and detail pages in the frontend application.

## Features

### 1. **Create Employee with Role**
When creating a new employee:
- Fill in the employee details
- Select an optional role from the "Role" dropdown (in Job Information section)
- The role is automatically assigned to the user after the employee is created

### 2. **View Employee Roles**
In the employee detail page:
- Click the "Roles" tab to view all assigned roles
- See role assignment details:
  - Role display name
  - Assignment date
  - Assigned by (if available)

### 3. **Assign/Remove Roles**
In the employee detail page (with edit permission):
- Click the "Roles" tab
- Click "Edit Profile" to enable editing
- Use the "Assign New Role" section:
  - Select an available role from the dropdown
  - Click "Assign" to assign the role
- Click "Remove" button on any assigned role to remove it

## Available Roles

| Role | Description |
|------|-------------|
| employee | Basic employee access |
| reporting_manager | Manager responsible for team members |
| project_lead | Lead of a project team |
| project_manager | Manager of project operations |
| hr_user | Human Resources user |
| finance_user | Finance department user |
| system_admin | System administrator with full access |

## Implementation Details

### New Files Created

#### Services
- **`apps/frontend/src/modules/employees/services/roleApi.ts`**
  - API client for role operations
  - Functions: `fetchRoles()`, `getUserRoles()`, `assignRoleToUser()`, `removeRoleFromUser()`

#### Hooks
- **`apps/frontend/src/modules/employees/hooks/useRoles.ts`**
  - React Query hooks for role management
  - Hooks: `useFetchRoles()`, `useGetUserRoles()`, `useAssignRole()`, `useRemoveRole()`

#### Components
- **`apps/frontend/src/modules/employees/components/RoleSelect.tsx`**
  - Reusable role selection component
  - Used for role assignment with checkboxes

- **`apps/frontend/src/modules/employees/components/RolesTab.tsx`**
  - Tab component for employee detail page
  - Displays assigned roles with assignment history
  - Allows role assignment and removal

### Modified Files

#### Pages
- **`apps/frontend/src/modules/employees/pages/EmployeeCreatePage.tsx`**
  - Added role dropdown in Job Information section
  - Added logic to assign role after employee creation

- **`apps/frontend/src/modules/employees/pages/EmployeeDetailPage.tsx`**
  - Added "Roles" tab
  - Integrated RolesTab component

## Usage

### Creating an Employee with Role

1. Navigate to **Employees** → **Create Employee**
2. Fill in employee details
3. In **Job Information** section, select a **Role** from the dropdown
4. Click **Create Employee**
5. The employee is created and the role is automatically assigned

### Managing Roles in Employee Detail

1. Navigate to **Employees** → **Select Employee**
2. Click the **Roles** tab
3. To view roles: See all assigned roles with assignment information
4. To assign/remove roles:
   - Click **Edit Profile** button
   - In "Assign New Role" section:
     - Select a role from dropdown
     - Click **Assign**
   - To remove a role: Click **Remove** on any assigned role

## API Endpoints Used

All endpoints require authentication with a valid JWT token.

### Get Available Roles
```bash
GET /api/v1/auth/roles/
Authorization: Bearer {token}
```

### Get User's Roles
```bash
GET /api/v1/auth/user-roles/user_roles/?user_id={user_id}
Authorization: Bearer {token}
```

### Assign Role to User
```bash
POST /api/v1/auth/user-roles/assign_role/
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "user_id_value",
  "role_name": "hr_user"
}
```

### Remove Role from User
```bash
POST /api/v1/auth/user-roles/remove_role/
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "user_id_value",
  "role_name": "hr_user"
}
```

## Error Handling

- **Invalid role**: Error message displayed if role assignment fails
- **Missing user**: Role assignment skipped if user ID not available
- **Permission denied**: Only users with HR or Admin roles can assign/remove roles
- **Duplicate role**: Error shown if attempting to assign role already assigned

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: TanStack React Query
- **API Communication**: Axios with custom client
- **Styling**: Tailwind CSS

## Notes

- Role assignment is optional when creating an employee
- Multiple roles can be assigned to a single user
- Role assignment history is tracked (assigned_at, assigned_by)
- Only users with appropriate permissions can manage roles
- Roles are cached in React Query for performance

## Future Enhancements

1. **Bulk Role Assignment**: Assign roles to multiple employees at once
2. **Role Templates**: Create role templates for quick assignment
3. **Time-Limited Roles**: Set expiration dates for role assignments
4. **Role History**: Full audit trail of role changes
5. **Department-Based Roles**: Automatically assign roles based on department

## Support

For issues or questions about role management:
1. Check the RBAC_QUICK_REFERENCE.md for API details
2. See docs/RBAC_IMPLEMENTATION.md for technical documentation
3. Review the component code for implementation details

---

**Feature Added:** December 28, 2025
**Status:** ✅ Complete and Ready to Use

