# Project Assignment - Installation & Debugging Guide

## Current Status

The backend code has been updated but the issue persists because `django_filters` may not be installed in the Python environment.

## Required Actions

### Step 1: Install django-filter Package

**Open a terminal and run:**

```bash
# Navigate to backend directory
cd /Users/tahiri/Tahir/development/5Data-HRMS/apps/backend

# Install using pip
pip install django-filter==23.5
```

**Or if using a virtual environment:**

```bash
# Activate venv if needed
source venv/bin/activate

# Install the package
pip install django-filter==23.5
```

**Or install all requirements:**

```bash
pip install -r requirements.txt
```

### Step 2: Verify Installation

After installation, verify django_filters is installed:

```bash
pip list | grep django-filter
```

Should show: `django-filter   23.5`

### Step 3: Stop and Restart Django Server

```bash
# Stop the current server (Ctrl+C if running)

# Restart the development server
python manage.py runserver
```

Watch for any import errors. The server should start without errors.

## What Was Changed

### Backend Changes Made:

1. **`apps/backend/core/settings.py`**
   - Added `'django_filters'` to `INSTALLED_APPS`
   - Added `'django_filters.rest_framework.DjangoFilterBackend'` to `DEFAULT_FILTER_BACKENDS`

2. **`apps/backend/projects/urls.py`**
   - Updated routing to use SimpleRouter for cleaner URL patterns
   - Separated projects and assignments into clear paths:
     - `/api/v1/projects/` - Projects endpoint
     - `/api/v1/projects/{id}/` - Project detail
     - `/api/v1/projects/assignments/` - Assignments endpoint
     - `/api/v1/projects/assignments/{id}/` - Assignment detail

3. **`apps/backend/projects/views.py`**
   - Added `filterset_fields = ['project']` to `ProjectAssignmentViewSet`
   - Added custom `assignments` action to `ProjectViewSet`

4. **`apps/backend/requirements.txt`**
   - Added `django-filter==23.5`

## Testing After Installation

Once the package is installed and server is restarted, test these URLs:

### 1. List all assignments
```
GET http://localhost:8000/api/v1/projects/assignments/
Status: 200 OK
```

### 2. Filter assignments by project (THIS WAS FAILING)
```
GET http://localhost:8000/api/v1/projects/assignments/?project=1
Status: 200 OK
Response: Array of assignments for project 1
```

### 3. Create new assignment (THIS WAS FAILING)
```
POST http://localhost:8000/api/v1/projects/assignments/
Headers: Content-Type: application/json
Body: {
  "employee": "1",
  "project": "1",
  "role": "Developer",
  "assigned_date": "2025-01-15"
}
Status: 201 Created
```

### 4. Update assignment
```
PATCH http://localhost:8000/api/v1/projects/assignments/1/
Headers: Content-Type: application/json
Body: {
  "role": "Senior Developer"
}
Status: 200 OK
```

### 5. Delete assignment
```
DELETE http://localhost:8000/api/v1/projects/assignments/1/
Status: 204 No Content
```

## Expected API Routes After Fix

After django_filters is installed and server restarts, the following routes should work:

```
Projects:
  GET    /api/v1/projects/                    - List projects
  POST   /api/v1/projects/                    - Create project
  GET    /api/v1/projects/{id}/               - Get project detail
  PATCH  /api/v1/projects/{id}/               - Update project
  DELETE /api/v1/projects/{id}/               - Delete project
  GET    /api/v1/projects/{id}/assignments/   - Get assignments for project

Assignments:
  GET    /api/v1/projects/assignments/                  - List all assignments
  GET    /api/v1/projects/assignments/?project=1       - Filter by project
  POST   /api/v1/projects/assignments/                  - Create assignment
  GET    /api/v1/projects/assignments/{id}/             - Get assignment detail
  PATCH  /api/v1/projects/assignments/{id}/             - Update assignment
  DELETE /api/v1/projects/assignments/{id}/             - Delete assignment
```

## Troubleshooting

### If Still Getting 404:

1. **Clear Django cache:**
   ```bash
   find . -type d -name __pycache__ -exec rm -r {} +
   find . -type f -name "*.pyc" -delete
   ```

2. **Restart server:**
   ```bash
   python manage.py runserver
   ```

3. **Check if app is in INSTALLED_APPS:**
   ```bash
   python manage.py shell
   >>> from django.conf import settings
   >>> 'django_filters' in settings.INSTALLED_APPS
   True  # Should return True
   ```

### If Still Getting 405 Method Not Allowed:

This typically means the viewset is configured correctly but the route isn't being recognized. Make sure:

1. `django_filters` is installed
2. Server has been restarted
3. No syntax errors in urls.py or views.py
4. INSTALLED_APPS has both `'rest_framework'` AND `'django_filters'`

### Check server logs:

The file `/Users/tahiri/Tahir/development/5Data-HRMS/apps/backend/logs/hrms.log` will show:
- Import errors
- "Not Found" warnings (404)
- "Method Not Allowed" warnings (405)

## Summary

The code is ready. You just need to:

1. **Install:** `pip install django-filter==23.5`
2. **Restart:** The Django development server
3. **Test:** The assignment creation and filtering should now work!

Once django_filters is installed and the server is restarted, all project assignment functionality should work correctly from the frontend.

