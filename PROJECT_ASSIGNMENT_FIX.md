# Project Assignment - Route Fix

## Issue
The assignment endpoint was returning a **405 Method Not Allowed** error when trying to POST a new assignment.

## Root Cause
The backend routing had both `ProjectViewSet` and `ProjectAssignmentViewSet` registered in the same router, causing incorrect URL patterns to be generated. The assignments endpoint was not properly accessible.

## Solution

### Backend Changes

#### 1. Fixed `/apps/backend/projects/urls.py`
**Before:**
```python
router = DefaultRouter()
router.register('', ProjectViewSet, basename='project')
router.register('assignments', ProjectAssignmentViewSet, basename='project-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
```

**After:**
```python
router = DefaultRouter()
router.register('', ProjectViewSet, basename='project')

# Separate router for assignments
assignment_router = DefaultRouter()
assignment_router.register('', ProjectAssignmentViewSet, basename='project-assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('assignments/', include(assignment_router.urls)),
]
```

**Why:** Separating the routers ensures that assignments are registered at `/projects/assignments/` directly, making POST requests work properly.

#### 2. Enhanced `/apps/backend/projects/views.py`
Added:
- Imported `action` decorator and `Response` for custom endpoints
- Added `assignments` action to `ProjectViewSet` for getting project-specific assignments
- Added `ordering_fields` to both viewsets for better filtering support

This allows:
- `GET /api/v1/projects/{id}/assignments/` - Get assignments for a specific project
- `GET /api/v1/projects/assignments/` - Get all assignments
- `POST /api/v1/projects/assignments/` - Create new assignment
- `PATCH /api/v1/projects/assignments/{id}/` - Update assignment
- `DELETE /api/v1/projects/assignments/{id}/` - Delete assignment

### Frontend Changes

#### Fixed `/apps/frontend/src/modules/projects/services/projectApi.ts`
Updated `getProjectAssignments` to filter by project ID:
```typescript
getProjectAssignments: (projectId: string) => {
  const params = new URLSearchParams({
    project: projectId,
  })
  return api.get<ProjectAssignment[]>(
    `${ASSIGNMENT_BASE_URL}/?${params}`
  )
}
```

## Available Endpoints After Fix

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/projects/` | List all projects |
| POST | `/api/v1/projects/` | Create new project |
| GET | `/api/v1/projects/{id}/` | Get project details |
| PATCH | `/api/v1/projects/{id}/` | Update project |
| DELETE | `/api/v1/projects/{id}/` | Delete project |
| GET | `/api/v1/projects/{id}/assignments/` | Get assignments for project (custom action) |
| GET | `/api/v1/projects/assignments/` | List all assignments |
| GET | `/api/v1/projects/assignments/?project={id}` | Filter assignments by project |
| POST | `/api/v1/projects/assignments/` | Create new assignment |
| PATCH | `/api/v1/projects/assignments/{id}/` | Update assignment |
| DELETE | `/api/v1/projects/assignments/{id}/` | Delete assignment |

## Testing

To test the fix, try the assignment flow:

1. Open a project detail page
2. Click on "Assignments" tab
3. Click "Assign Employee"
4. Select an employee and role
5. Click "Add Assignment"

The POST request to `/api/v1/projects/assignments/` should now succeed with a 201 Created response.

## Notes

- The backend now supports filtering assignments by project using query params
- The `ProjectViewSet` now has a custom action to get project-specific assignments
- Both list and detail endpoints are fully functional
- All CRUD operations are supported for assignments

