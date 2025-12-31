# Timesheet Module Implementation - Complete

## Overview
A comprehensive weekly timesheet management system has been implemented with full CRUD operations, status workflow (draft → submitted → approved/rejected), and manager approval capabilities.

## Key Features Implemented

### ✅ Backend Implementation

#### Models (`apps/backend/timesheets/models.py`)
- **Timesheet Model**: Represents a week's timesheet with:
  - `week_start` and `week_end` dates (month-bounded)
  - Status: draft, submitted, approved, rejected
  - Total hours calculation
  - Approval tracking with manager reference
  - Rejection reason field
  - Utility function `get_month_weeks()` for calculating month-bounded week boundaries

- **TimesheetRow Model**: Represents project/task entry with:
  - 7 day columns (Sun-Sat with daily hours)
  - Free text task description
  - Auto-calculated row totals
  - Methods for validation

- **Validation**:
  - Max 8 hours per day (across all rows)
  - Daily totals calculation
  - Automatic total hours calculation

#### Serializers (`apps/backend/timesheets/serializers.py`)
- `TimesheetRowSerializer`: Serializes individual row data with project info
- `TimesheetSerializer`: Main serializer with nested rows and daily totals
- `TimesheetCreateUpdateSerializer`: Handles creation/update with validation
- `TimesheetApprovalSerializer`: Handles approve/reject actions

#### Views (`apps/backend/timesheets/views.py`)
- **Endpoints**:
  - `GET /timesheets/` - List all (role-based filtering)
  - `POST /timesheets/` - Create new timesheet
  - `GET /timesheets/{id}/` - Retrieve single timesheet
  - `PATCH /timesheets/{id}/` - Update (draft/rejected only)
  - `DELETE /timesheets/{id}/` - Soft delete
  - `GET /timesheets/my_timesheets/` - User's timesheets
  - `POST /timesheets/{id}/submit/` - Submit for approval
  - `POST /timesheets/{id}/approve/` - Manager approval
  - `POST /timesheets/{id}/reject/` - Manager rejection with reason
  - `GET /timesheets/team/` - Manager's team timesheets

- **Permission Checks**:
  - Users can only edit their own draft/rejected timesheets
  - Only reporting managers can approve/reject
  - Admins and HR users see all timesheets

#### Database Migration
- Migration `0002_timesheetrow_delete_timesheetentry_and_more.py` created and applied
- Converts old `TimesheetEntry` to new `TimesheetRow` model

---

### ✅ Frontend Implementation

#### Shared Types (`packages/shared/src/types/timesheet.ts`)
- Updated `Timesheet` interface with:
  - Row-based structure
  - Daily totals dictionary
  - Manager approval tracking
- `TimesheetRow` interface with all 7 day columns
- Request/Response types for all operations

#### Services (`apps/frontend/src/modules/timesheets/services/timesheetApi.ts`)
- Complete API client with:
  - Fetch user's timesheets
  - Create/update/delete operations
  - Submit, approve, reject actions
  - Team timesheet retrieval

#### Hooks (`apps/frontend/src/modules/timesheets/hooks/useTimesheets.ts`)
- React Query hooks for all operations:
  - `useMyTimesheets()` - User's timesheets
  - `useTimesheet(id)` - Single timesheet detail
  - `useCreateTimesheet()` - Create new
  - `useUpdateTimesheet(id)` - Update existing
  - `useSubmitTimesheet(id)` - Submit action
  - `useApproveTimesheet(id)` - Approve action
  - `useRejectTimesheet(id)` - Reject action
  - `useTeamTimesheets()` - Manager's team list

#### Pages

**TimesheetListPage** (`/timesheets`)
- List all user's timesheets
- Display: Week range, Total hours, Status badge, Submitted date
- Actions: View, Delete (draft only)
- Create new timesheet button
- Empty state with CTA

**TimesheetPage** (`/timesheets/new` | `/timesheets/:id`)
- Main weekly grid entry interface
- Features:
  - Week selector with date inputs
  - 7-column grid (Sun-Sat) with date headers
  - Rows: Project input, Task description (free text), Daily hours
  - Automatic daily total calculation (with 8-hour max validation)
  - Add/Remove row functionality
  - Save as draft / Submit buttons
  - Read-only mode for approved/submitted timesheets
  - Rejection reason display
  - Responsive overflow table
  - Real-time validation and error messages

**TeamTimesheetsPage** (`/timesheets/team`)
- Manager approval workflow
- List of pending team timesheets (submitted/rejected)
- Expandable rows showing:
  - Full timesheet grid
  - Daily totals
  - Project and task details
- Approval actions:
  - Approve button
  - Reject with reason field
  - View full details link
- Role-based access (reporting managers only)

#### Routes (`apps/frontend/src/app/App.tsx`)
Added protected routes:
- `GET /timesheets` → TimesheetListPage
- `GET /timesheets/new` → TimesheetPage (create)
- `GET /timesheets/:id` → TimesheetPage (view/edit)
- `GET /timesheets/team` → TeamTimesheetsPage (managers only)

---

## Business Rules Implemented

✅ **Week Structure (Month-Bounded)**
- Week 1: 1st of month → First Sunday
- Week 2-4: Monday → Sunday (full weeks)
- Week 5: Monday → End of month

✅ **Status Workflow**
- Draft → Submitted (employee)
- Submitted → Approved (manager)
- Submitted → Rejected (manager)
- Rejected → Draft (resubmit)

✅ **Permissions**
- Employees can only edit their draft/rejected timesheets
- Employees cannot modify submitted/approved timesheets
- Only reporting managers can approve/reject
- Managers see only their team's timesheets

✅ **Validation**
- Max 8 hours per day total (across all rows)
- At least one row required per timesheet
- Rejection requires reason text

✅ **Features**
- Task description is free text (any content)
- Daily totals auto-calculated and displayed
- Rejection reasons stored and displayed
- Soft deletes implemented
- Full audit trail with timestamps

---

## Database Schema

### Timesheet Table
```
- id (PK)
- employee_id (FK)
- week_start (DATE)
- week_end (DATE)
- status (CHAR: draft, submitted, approved, rejected)
- total_hours (DECIMAL)
- submitted_at (DATETIME, nullable)
- approved_at (DATETIME, nullable)
- approved_by_id (FK, nullable)
- rejection_reason (TEXT)
- created_at (DATETIME, auto)
- updated_at (DATETIME, auto)
- deleted_at (DATETIME, soft delete)
- Unique: (employee_id, week_start)
- Indexes: (employee_id, week_start), (status)
```

### TimesheetRow Table
```
- id (PK)
- timesheet_id (FK)
- project_id (FK)
- task_description (VARCHAR 255)
- sun_hours to sat_hours (DECIMAL, 0-8)
- created_at (DATETIME)
- updated_at (DATETIME)
- Unique: (timesheet_id, project_id, task_description)
- Indexes: (timesheet_id), (project_id)
```

---

## Testing Checklist

- [ ] Create a new timesheet with multiple rows
- [ ] Add hours to different days (validate max 8 hours per day)
- [ ] Save as draft and verify data is persisted
- [ ] Submit timesheet and verify status changes
- [ ] Manager approves timesheet
- [ ] Manager rejects with reason
- [ ] Employee edits rejected timesheet and resubmits
- [ ] Try to edit submitted/approved timesheet (should fail)
- [ ] Verify daily totals update correctly
- [ ] Delete draft timesheet
- [ ] View list with status badges
- [ ] Access control (non-managers cannot see team page)

---

## File Structure

```
Backend:
- apps/backend/timesheets/
  ├── models.py (Updated)
  ├── serializers.py (Updated)
  ├── views.py (Updated)
  ├── admin.py (Updated)
  └── migrations/
      └── 0002_timesheetrow_delete_timesheetentry_and_more.py (New)

Frontend:
- apps/frontend/src/modules/timesheets/
  ├── services/
  │   └── timesheetApi.ts (New)
  ├── hooks/
  │   └── useTimesheets.ts (New)
  └── pages/
      ├── TimesheetListPage.tsx (New)
      ├── TimesheetPage.tsx (New)
      └── TeamTimesheetsPage.tsx (New)

Shared:
- packages/shared/src/types/
  └── timesheet.ts (Updated)

Routes:
- apps/frontend/src/app/
  └── App.tsx (Updated)
```

---

## Implementation Status

✅ All 11 todos completed:
1. ✅ Backend models
2. ✅ Backend serializers
3. ✅ Backend views
4. ✅ Database migration
5. ✅ Shared types
6. ✅ Frontend API service
7. ✅ Frontend hooks
8. ✅ Timesheet list page
9. ✅ Timesheet entry page
10. ✅ Team approval page
11. ✅ Frontend routes

**Ready for testing and deployment!**

