# Project Assignment Implementation

## Overview

Implemented the ability to assign active employees to projects through the Projects module frontend.

## Changes Made

### 1. Enhanced API Service (`apps/frontend/src/modules/projects/services/projectApi.ts`)

Added the following methods to handle project assignments:

- `getProjectAssignments(projectId)` - Fetch all assignments for a project
- `createAssignment(data)` - Create a new employee-project assignment
- `updateAssignment(id, data)` - Update an existing assignment (change role or mark as unassigned)
- `deleteAssignment(id)` - Remove an assignment

### 2. Enhanced React Query Hooks (`apps/frontend/src/modules/projects/hooks/useProjects.ts`)

Added the following hooks for assignment management:

- `useProjectAssignments(projectId)` - Fetch assignments with caching
- `useCreateAssignment()` - Create assignment mutation
- `useUpdateAssignment(projectId)` - Update assignment mutation
- `useDeleteAssignment(projectId)` - Delete assignment mutation

All mutations automatically invalidate and refetch assignment data on success.

### 3. New AssignmentsTab Component (`apps/frontend/src/modules/projects/components/AssignmentsTab.tsx`)

A complete component for managing project assignments with:

**Features:**
- Display all employees assigned to the project
- Add new employee assignments with:
  - Employee selection (filters out already assigned employees)
  - Role designation
  - Assignment date picker
- Remove assignments (with confirmation)
- Shows employee profile pictures, ID, and name
- Role-based visibility (only admins can add/remove)

**UI Elements:**
- Employee avatar with initials fallback
- Assignment cards showing employee info, role, and assigned date
- Add Assignment button with form
- Delete buttons on each assignment
- Empty state message when no assignments exist

### 4. Updated ProjectDetailPage (`apps/frontend/src/modules/projects/pages/ProjectDetailPage.tsx`)

- Imported AssignmentsTab component
- Connected the "Assignments" tab to the new component
- Passes projectId and canEdit props to AssignmentsTab
- Maintained two-tab structure: "Details" and "Assignments"

## User Flow

1. **View Project Details**
   - Navigate to `/projects/:id`
   - Click on "Assignments" tab

2. **Assign Employees**
   - Click "Assign Employee" button (admin only)
   - Select an active employee from dropdown
   - Enter their role on the project
   - Choose assignment date (defaults to today)
   - Click "Add Assignment"

3. **View Assignments**
   - See all assigned employees in a list
   - Each card shows:
     - Employee avatar
     - Employee name and ID
     - Assigned role
     - Assignment date

4. **Remove Assignments**
   - Click trash icon on any assignment (admin only)
   - Confirm removal

## Data Model

### ProjectAssignment
```typescript
{
  id: string;
  employee_id: string;
  project_id: string;
  role: string;
  assigned_date: string;
  unassigned_date?: string; // Used to mark past assignments
}
```

## Backend Requirements

The following endpoints must exist:

- `GET /api/v1/projects/{id}/assignments/` - List assignments for a project
- `POST /api/v1/projects/assignments/` - Create new assignment
- `PATCH /api/v1/projects/assignments/{id}/` - Update assignment
- `DELETE /api/v1/projects/assignments/{id}/` - Delete assignment

Backend should filter employees by `employment_status='active'` in the employee list endpoint.

## Role-Based Access

- Only users with admin role can:
  - Add new assignments
  - Remove assignments

- All authenticated users can:
  - View assignments

## Design Consistency

- Follows existing design system (Tailwind CSS, Heroicons)
- Card-based layout
- Primary blue color for interactive elements
- Status colors maintained
- Consistent spacing and typography with rest of app

## Future Enhancements

- Edit existing assignment roles inline
- Bulk assign employees to project
- Assignment history and audit log
- Export assignments to CSV
- Assignment templates for similar projects
- Team assignment (assign multiple employees at once)

