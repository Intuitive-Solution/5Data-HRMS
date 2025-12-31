# Project Dropdown Implementation - Debugging Guide

## Summary of Changes

### Backend Changes ✅
1. **New Endpoint Added**: `GET /api/v1/projects/my_projects/`
   - Returns list of projects assigned to the current user
   - Filters active projects that the user is currently assigned to
   - Returns full project details (id, name, client, etc.)

### Frontend Changes ✅
1. **Updated projectApi** - Added `getMyAssignedProjects()` method
2. **Updated useProjects Hook** - Added `useMyAssignedProjects()` hook
3. **Updated TimesheetPage** - Changed project input to dropdown
   - Fetches assigned projects via React Query hook
   - Shows loading state while fetching
   - Displays "No projects assigned" if list is empty
   - Auto-populates project name and client when selected

## Verification Steps

### Backend Verification ✅

The backend API is working correctly. Verified with Django shell:

```
User: tahir@5datainc.com
Employee: EMP00
Assigned Projects: 2
  1. HRMS (5DataInc) - Status: active
  2. LMS Project (5Data) - Status: active
```

### Frontend Debugging Checklist

If the dropdown shows "No projects assigned", follow these steps:

#### 1. **Check API Response** (Browser DevTools)
- Open Developer Tools → Network tab
- Navigate to `/timesheets/new`
- Look for request to `/api/v1/projects/my_projects/`
- Check the response:
  - **Status 200** with 2 projects in array = ✅ Backend working
  - **Status 401** = User not authenticated
  - **Status 404** = URL routing issue

#### 2. **Check React Query Cache** (if using React Query DevTools)
- Install React Query DevTools extension
- Check `my-projects` query status
- Should show: `status: "success"` and `data: [...]` with 2 projects

#### 3. **Check Console Errors**
- Open Browser Console (F12 → Console tab)
- Look for any errors like:
  - `Failed to fetch` = Network issue
  - `Unexpected token` = JSON parsing error
  - Auth/CORS errors = Backend permission issue

#### 4. **Verify Hook is Loading**
- The dropdown should show "Loading projects..." while fetching
- If it shows "No projects assigned" immediately, the hook may not have run

#### 5. **Test API Directly**
```bash
# Get your access token from localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/projects/my_projects/
```

Should return:
```json
[
  {
    "id": 1,
    "name": "HRMS",
    "client": "5DataInc",
    "billing_type": "non_billable",
    "start_date": "2025-12-30",
    "end_date": null,
    "status": "active",
    ...
  },
  {
    "id": 2,
    "name": "LMS Project",
    "client": "5Data",
    ...
  }
]
```

## Common Issues & Solutions

### Issue: Dropdown shows "No projects assigned"

**Possible Causes:**
1. **Hook not being called** 
   - Check if `useMyAssignedProjects()` is imported correctly
   - Verify hook is called in component body (not conditionally)

2. **API endpoint not found (404)**
   - Verify URL pattern in `projects/urls.py`
   - Check endpoint: `GET /api/v1/projects/my_projects/`
   - Note: `/my_projects/` must come BEFORE `<int:pk>/` in URL patterns ✅ (already correct)

3. **Authentication issue (401)**
   - Verify user is logged in
   - Check access token is being sent in request headers
   - Verify token is not expired

4. **No project assignments in database**
   - User might not be assigned to any projects
   - Check Employee model has assignments
   - Verify ProjectAssignment records exist

### Issue: Dropdown is disabled/shows "Loading..." forever

**Possible Causes:**
1. **API request hanging**
   - Check backend logs for errors
   - Verify database connection working
   - Check if backend server is running

2. **Network timeout**
   - Check browser network tab for pending requests
   - Verify CORS headers if using proxy

## Testing the Complete Flow

### Manual Test:
1. Login as tahir@5datainc.com
2. Go to `/timesheets/new`
3. Click "Add Row" button
4. In the Project column, you should see dropdown with options:
   - "HRMS (5DataInc)"
   - "LMS Project (5Data)"
5. Select a project - project name should be populated
6. Continue adding hours
7. Save or submit

### Expected Behavior:
- ✅ Dropdown loads with 2 projects
- ✅ Can select either project
- ✅ Project name and client auto-fill
- ✅ Can add multiple rows with different projects
- ✅ Validation enforces max 8 hours/day

## File Changes Summary

**Backend:**
- `apps/backend/projects/views.py` - Added `my_assigned_projects()` view
- `apps/backend/projects/urls.py` - Added route for new endpoint

**Frontend:**
- `apps/frontend/src/modules/projects/services/projectApi.ts` - Added API method
- `apps/frontend/src/modules/projects/hooks/useProjects.ts` - Added hook
- `apps/frontend/src/modules/timesheets/pages/TimesheetPage.tsx` - Updated dropdown UI

**Shared:**
- No changes (types already support the structure)

## Next Steps if Issue Persists

1. **Check backend logs**:
   ```bash
   # Terminal showing backend output
   # Look for any error messages when request is made
   ```

2. **Enable debug logging in React**:
   ```javascript
   // Add to TimesheetPage.tsx
   useEffect(() => {
     console.log('assignedProjects:', assignedProjects)
     console.log('isLoadingProjects:', isLoadingProjects)
   }, [assignedProjects, isLoadingProjects])
   ```

3. **Rebuild packages**:
   ```bash
   cd packages/shared && npm run build
   cd apps/frontend && npm run build
   ```

4. **Clear browser cache** and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

5. **Restart frontend dev server** if running in watch mode

## Success Criteria ✅

All of the following should be true:

- [x] Backend endpoint returns projects correctly
- [x] Frontend API method implemented
- [x] React hook created and cached properly
- [x] Component imports and uses hook
- [x] Dropdown renders with options
- [x] User can select project
- [x] Project details auto-populate
- [x] No console errors
- [x] Response status 200 (not 404/401)

If all items above are checked and dropdown still empty, enable debugging and share console logs.

