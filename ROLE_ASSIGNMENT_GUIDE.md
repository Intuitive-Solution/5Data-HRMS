# Employee Role Assignment - Visual Guide

## Quick Start

### ✅ Assigning Roles During Employee Creation

```
1. Navigate to: Employees → Create Employee
                ↓
2. Fill in employee details:
   - First Name, Last Name
   - Email
   - Employee ID
   - Job Title
   - Department
   - Employment Type
   - Date of Joining
   - etc.
                ↓
3. Scroll to "Job Information" section
                ↓
4. FIND THE "Role" DROPDOWN (New field!)
   ┌─────────────────────────────┐
   │ Role                    ▼   │
   ├─────────────────────────────┤
   │ ○ Select a role (optional)  │
   │ ○ Employee                  │
   │ ○ Reporting Manager         │
   │ ○ Project Lead              │
   │ ○ Project Manager           │
   │ ○ HR User                   │
   │ ○ Finance User              │
   │ ○ System Admin              │
   └─────────────────────────────┘
                ↓
5. Select desired role
                ↓
6. Click "Create Employee" button
                ↓
✅ Employee created with role automatically assigned!
```

---

### ✅ Managing Roles on Existing Employee

```
1. Navigate to: Employees → Select Employee
                ↓
2. Employee detail page opens
                ↓
3. FIND THE "Roles" TAB (New tab!)
   ┌────────────┬────────┬───────┬────────┬─────────┐
   │Personal... │ Job... │ Work..│ Roles ◀│Docs... │
   └────────────┴────────┴───────┴────────┴─────────┘
                ↓
4. Click "Roles" tab
                ↓
5. SEE CURRENT ROLES:
   ┌──────────────────────────────────┐
   │ Assigned Roles                   │
   ├──────────────────────────────────┤
   │ ┌─ HR User                    ┐  │
   │ │ Assigned on 12/28/2025      │  │
   │ │ by admin@example.com     │Remove│
   │ └──────────────────────────┘  │
   │                                │
   │ ┌─ System Admin            ┐  │
   │ │ Assigned on 12/28/2025      │  │
   │ │ by admin@example.com     │Remove│
   │ └──────────────────────────┘  │
   └──────────────────────────────────┘
                ↓
6. TO ASSIGN NEW ROLES:
   • Click "Edit Profile" button
   • Scroll to "Assign New Role" section
   • Select role from dropdown
   • Click "Assign" button
   
7. TO REMOVE ROLES:
   • Click "Edit Profile" button
   • Click "Remove" button on any role
                ↓
✅ Roles updated in real-time!
```

---

## Role Hierarchy

```
System Admin (system_admin)
    ├─ Full system access
    ├─ Can manage all roles
    └─ Can access all features

HR User (hr_user)
    ├─ Employee management
    ├─ Leave management
    └─ Can assign some roles

Finance User (finance_user)
    ├─ Financial reports access
    └─ Financial data visibility

Project Manager (project_manager)
    ├─ Project management
    ├─ Team assignment
    └─ Budget management

Project Lead (project_lead)
    ├─ Project oversight
    ├─ Team coordination
    └─ Status reporting

Reporting Manager (reporting_manager)
    ├─ Team member oversight
    ├─ Leave approval
    └─ Performance tracking

Employee (employee)
    ├─ Basic access
    ├─ View own data
    └─ Submit timesheets
```

---

## Features at a Glance

### CREATE PAGE
| Feature | Status | Location |
|---------|--------|----------|
| Role dropdown | ✅ New | Job Information section |
| Auto-assign after create | ✅ New | Automatic |
| All 7 roles available | ✅ Yes | Dropdown |
| Optional field | ✅ Yes | Can leave empty |

### DETAIL PAGE
| Feature | Status | Location |
|---------|--------|----------|
| View roles | ✅ New | Roles tab |
| Assignment history | ✅ New | Under each role |
| Add roles | ✅ New | Roles tab (edit mode) |
| Remove roles | ✅ New | Roles tab (edit mode) |
| Real-time updates | ✅ Yes | Immediate |
| Error handling | ✅ Yes | In-form messages |

---

## Step-by-Step Walkthrough

### Scenario 1: Creating a New HR Employee

```
Step 1: Create Employee Page
├─ Enter: John Smith
├─ Email: john.smith@company.com
├─ Employee ID: EMP-0001
├─ Job Title: HR Specialist
├─ Department: Human Resources
├─ Employment Type: Full Time
└─ Role: ▼ [Select a role]
   └─ ▼ HR User ◄── SELECT THIS

Step 2: Click "Create Employee"
└─ Employee created successfully
   └─ HR User role assigned automatically

Step 3: Employee is now an HR User
└─ Can access HR functions
```

### Scenario 2: Promoting an Employee to Manager

```
Step 1: Open Employee Details
├─ Employee: Jane Doe (HR User)

Step 2: Roles Tab
├─ View current role: HR User

Step 3: Click "Edit Profile"
├─ "Assign New Role" section appears

Step 4: Assign Manager Role
├─ Role dropdown: ▼
│  └─ Select "Reporting Manager"
├─ Click "Assign"
└─ Role assigned successfully

Step 5: Jane now has TWO roles
├─ HR User
└─ Reporting Manager
```

### Scenario 3: Removing a Role

```
Step 1: Open Employee Details
├─ Employee: Bob Wilson

Step 2: Roles Tab
├─ View roles:
│  ├─ Project Manager
│  ├─ Project Lead
│  └─ Employee

Step 3: Click "Edit Profile"

Step 4: Remove "Project Lead" Role
├─ Find "Project Lead" in list
├─ Click "Remove" button
└─ Role removed successfully

Step 5: Bob now has TWO roles
├─ Project Manager
└─ Employee
```

---

## Common Workflows

### 👤 Onboarding a New Employee
```
1. Create Employee Form
   ↓ Fill all fields
   ↓ Select Role: "Employee"
   ↓ Click Create
   ✅ New employee with basic role
```

### 🏢 Departmental Assignment
```
1. Employee Detail Page
2. Click "Roles" tab
3. Click "Edit Profile"
4. Assign Department Role:
   - HR: "HR User"
   - Finance: "Finance User"
   - Projects: "Project Manager" or "Project Lead"
5. Click "Assign"
   ✅ Department role assigned
```

### 📈 Role Promotion
```
1. Open Employee
2. Roles Tab
3. Edit Mode
4. Assign New Role:
   - "Reporting Manager" (for team lead)
   - "Project Manager" (for project lead)
5. Click Assign
   ✅ Employee promoted to new role
```

### 🔄 Temporary Assignment
```
1. Open Employee
2. Roles Tab
3. Edit Mode
4. Assign Temporary Role
5. Later, remove role when not needed
   ✅ Flexible role management
```

---

## Tips & Tricks

### 💡 Quick Tips

1. **Optional Role**: You can create employees without assigning a role
2. **Multiple Roles**: Users can have multiple roles simultaneously
3. **Real-time Updates**: Role changes take effect immediately
4. **Role History**: See who assigned roles and when
5. **Edit Permission**: Only HR/Admin can modify roles

### ⚠️ Important Notes

- Role dropdown in create page has ALL 7 roles
- Roles tab shows assignment history
- Can't assign same role twice (already assigned check)
- Removing role requires edit permission
- Changes are instant - no need to refresh

### 🔒 Permission Requirements

| Action | Required Role |
|--------|---------------|
| Create Employee | Any Authenticated User |
| Assign Role | HR User or System Admin |
| Remove Role | HR User or System Admin |
| View Roles | Any Authenticated User |

---

## Troubleshooting

### ❓ I don't see the Role dropdown

**Solution**: Make sure you're on the "Create Employee" page in the "Job Information" section. The dropdown appears after the "Reporting Manager" field.

### ❓ I can't assign roles

**Solution**: You need HR User or System Admin role. Contact your HR administrator.

### ❓ Role assignment failed

**Solution**: 
- Check your internet connection
- Make sure the role isn't already assigned
- Try refreshing and trying again

### ❓ Where's the Roles tab?

**Solution**: Open any employee detail page. The "Roles" tab is the 4th tab (after Personal Info, Job Info, and Work Info).

---

## Next Steps

1. **Start Using**: Create or edit employees and assign roles
2. **Test Access**: Login as different roles to verify permissions
3. **Explore**: Try assigning multiple roles to a user
4. **Monitor**: Check role assignment history for audit

---

**Feature Status**: ✅ Live and Ready
**Last Updated**: December 28, 2025

For detailed API documentation, see: [RBAC_QUICK_REFERENCE.md](RBAC_QUICK_REFERENCE.md)

