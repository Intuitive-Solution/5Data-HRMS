# Project Assignment Setup Checklist

## ✅ Code Changes (COMPLETED)

All code has been updated. Here's what was done:

### Backend Code Changes

- [x] Updated `apps/backend/core/settings.py`
  - Added `'django_filters'` to INSTALLED_APPS
  - Added `'django_filters.rest_framework.DjangoFilterBackend'` to REST_FRAMEWORK config

- [x] Updated `apps/backend/projects/views.py`
  - Added filtering support with `filterset_fields = ['project']`
  - Added custom action for getting project-specific assignments

- [x] Updated `apps/backend/projects/urls.py`
  - Fixed routing structure using SimpleRouter
  - Clear separation of projects and assignments endpoints

- [x] Updated `apps/backend/requirements.txt`
  - Added `django-filter==23.5` dependency

### Frontend Code Changes

- [x] Created `apps/frontend/src/modules/projects/services/projectApi.ts`
  - Added assignment CRUD methods
  - Proper filtering by project ID

- [x] Created `apps/frontend/src/modules/projects/hooks/useProjects.ts`
  - Added assignment query hooks
  - Added assignment mutation hooks

- [x] Created `apps/frontend/src/modules/projects/components/AssignmentsTab.tsx`
  - Complete UI for managing assignments
  - Add, view, and remove functionality

- [x] Updated `apps/frontend/src/modules/projects/pages/ProjectDetailPage.tsx`
  - Integrated AssignmentsTab component
  - Connected to assignments tab

- [x] Updated `apps/frontend/src/app/App.tsx`
  - Added project routes

## ⚠️ REQUIRED SETUP STEPS (YOU MUST DO THIS)

### Step 1: Install Django Filter Package

Open terminal and run:

```bash
cd /Users/tahiri/Tahir/development/5Data-HRMS/apps/backend

# Install the missing package
pip install django-filter==23.5

# Or install all requirements
pip install -r requirements.txt
```

**Verify installation:**
```bash
pip list | grep django-filter
```

### Step 2: Stop Django Server

If the development server is running:
```
Press Ctrl+C
```

### Step 3: Clear Python Cache

```bash
cd /Users/tahiri/Tahir/development/5Data-HRMS/apps/backend

# Clear __pycache__ directories
find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true

# Clear .pyc files
find . -type f -name "*.pyc" -delete
```

### Step 4: Restart Django Server

```bash
python manage.py runserver
```

**Expected output:**
```
Watching for file changes with StatReloader
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

## ✅ Testing Checklist

After completing setup steps, test the following:

### Frontend Tests

- [ ] Navigate to `/projects` - Projects list should load
- [ ] Click on a project - Project detail should load
- [ ] Click "Assignments" tab - Should show current assignments
- [ ] Click "Assign Employee" - Form should appear
- [ ] Select an employee and enter role - Form should work
- [ ] Click "Add Assignment" - Assignment should be created (no more 405 error!)
- [ ] Assignment should appear in the list
- [ ] Click trash icon - Assignment should be removed

### API Tests

**Using curl or Postman:**

```bash
# 1. Get all projects
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/projects/

# 2. Create a project
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","client":"Client","billing_type":"time_and_material","start_date":"2025-01-15"}' \
  http://localhost:8000/api/v1/projects/

# 3. Get assignments for project 1 (THIS WAS FAILING)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/projects/assignments/?project=1

# 4. Create assignment (THIS WAS FAILING)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"employee":"1","project":"1","role":"Developer","assigned_date":"2025-01-15"}' \
  http://localhost:8000/api/v1/projects/assignments/

# 5. Get assignment details
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/projects/assignments/1/

# 6. Update assignment
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"Senior Developer"}' \
  http://localhost:8000/api/v1/projects/assignments/1/

# 7. Delete assignment
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/projects/assignments/1/
```

## 📋 Files Modified

**Backend:**
- `apps/backend/core/settings.py` - Added django_filters config
- `apps/backend/projects/views.py` - Added filtering support
- `apps/backend/projects/urls.py` - Fixed routing
- `apps/backend/requirements.txt` - Added django-filter dependency

**Frontend:**
- `apps/frontend/src/modules/projects/services/projectApi.ts` - New file
- `apps/frontend/src/modules/projects/hooks/useProjects.ts` - New file
- `apps/frontend/src/modules/projects/components/AssignmentsTab.tsx` - New file
- `apps/frontend/src/modules/projects/pages/ProjectDetailPage.tsx` - Updated
- `apps/frontend/src/app/App.tsx` - Updated

## 🎯 Expected Behavior After Setup

### GET /api/v1/projects/assignments/?project=1
- ✅ Status: 200 OK (was 404)
- ✅ Returns: Array of assignments for that project
- ✅ Supports filtering, searching, ordering

### POST /api/v1/projects/assignments/
- ✅ Status: 201 Created (was 405)
- ✅ Creates: New project assignment
- ✅ Returns: Created assignment with ID

### Frontend
- ✅ AssignmentsTab loads without errors
- ✅ Can assign employees to projects
- ✅ Can view all assignments
- ✅ Can remove assignments

## 🚀 Next Steps

1. **Install django-filter** - CRITICAL
2. **Restart server** - Important
3. **Test endpoints** - Verify everything works
4. **Test frontend** - Use the assignment UI
5. **Deploy to production** - When ready

## ❓ Troubleshooting

If you still get errors after completing all steps:

1. Check `/Users/tahiri/Tahir/development/5Data-HRMS/apps/backend/logs/hrms.log` for import errors
2. Run `pip list | grep django` to verify installation
3. Clear browser cache and restart frontend dev server
4. Check that settings.py has both 'rest_framework' AND 'django_filters' in INSTALLED_APPS

## 📞 Key Issue & Solution

**Problem:** 404 and 405 errors when accessing `/api/v1/projects/assignments/`

**Root Cause:** `django_filters` package not installed

**Solution:** 
```bash
pip install django-filter==23.5
python manage.py runserver
```

That's it! The code is ready, just need the package installed.

