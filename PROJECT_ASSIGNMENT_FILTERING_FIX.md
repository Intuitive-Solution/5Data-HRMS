# Project Assignment - Filtering Fix (404 Error)

## Issue
The GET request to `/api/v1/projects/assignments/?project=1` was returning a **404 Not Found** error instead of filtering assignments by project.

## Root Cause
The Django REST Framework configuration was missing `django_filters` integration, which is required to use `filterset_fields` in viewsets.

## Solution

### 1. Added django-filter to INSTALLED_APPS
**File:** `apps/backend/core/settings.py`

```python
INSTALLED_APPS = [
    # ...
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'django_filters',  # ADD THIS
    # ...
]
```

### 2. Updated REST_FRAMEWORK Configuration
**File:** `apps/backend/core/settings.py`

**Before:**
```python
'DEFAULT_FILTER_BACKENDS': (
    'rest_framework.filters.SearchFilter',
    'rest_framework.filters.OrderingFilter',
),
```

**After:**
```python
'DEFAULT_FILTER_BACKENDS': (
    'django_filters.rest_framework.DjangoFilterBackend',  # ADD THIS
    'rest_framework.filters.SearchFilter',
    'rest_framework.filters.OrderingFilter',
),
```

### 3. Added filterset_fields to ProjectAssignmentViewSet
**File:** `apps/backend/projects/views.py`

```python
class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    """Project assignment viewset."""
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee__employee_id', 'project__name']
    ordering_fields = ['assigned_date', 'created_at']
    filterset_fields = ['project']  # ADD THIS
```

### 4. Added django-filter to requirements.txt
**File:** `apps/backend/requirements.txt`

```
django-filter==23.5
```

## Required Steps After Changes

1. **Install the package:**
   ```bash
   pip install django-filter==23.5
   ```

2. **Restart the Django development server:**
   ```bash
   python manage.py runserver
   ```

## How Filtering Works Now

The endpoint now supports filtering by project:

```
GET /api/v1/projects/assignments/?project=1
```

This will return all assignments for project with ID 1.

### Example Response

```json
[
  {
    "id": "123",
    "employee": "456",
    "project": "1",
    "role": "Developer",
    "assigned_date": "2025-01-15",
    "unassigned_date": null,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

## Additional Query Parameters

The endpoint now supports multiple filters and operations:

- **Filter by project:** `?project=1`
- **Search by employee ID:** `?search=EMP001`
- **Search by project name:** `?search=ProjectName`
- **Order by assigned date:** `?ordering=assigned_date`
- **Reverse order:** `?ordering=-assigned_date`
- **Combine filters:** `?project=1&ordering=-assigned_date`

## Frontend Impact

The frontend API service is already configured to use this filtering:

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

This will now work correctly and return assignments for the specific project.

## Testing

After deployment, test the following:

1. **List all assignments:**
   ```
   GET /api/v1/projects/assignments/
   ```

2. **Filter by project:**
   ```
   GET /api/v1/projects/assignments/?project=1
   ```

3. **Create assignment:**
   ```
   POST /api/v1/projects/assignments/
   Body: {
     "employee": "1",
     "project": "1",
     "role": "Developer",
     "assigned_date": "2025-01-15"
   }
   ```

4. **Update assignment:**
   ```
   PATCH /api/v1/projects/assignments/1/
   Body: {
     "role": "Senior Developer"
   }
   ```

5. **Delete assignment:**
   ```
   DELETE /api/v1/projects/assignments/1/
   ```

All requests should now succeed without 404 errors.

