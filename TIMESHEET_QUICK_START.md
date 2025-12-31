# Timesheet Module - Quick Start Guide

## User Workflows

### Employee: Creating a Timesheet

1. Navigate to **Timesheets** → Click **New Timesheet**
2. System auto-selects current week (Sun-Sat)
3. Click **Add Row** to add project entries
4. Fill in:
   - **Project** (dropdown, shows assigned projects)
   - **Task Description** (free text - any work description)
   - **Daily hours** (Sun-Sat columns, max 8 per day)
5. Review **Daily Total** row (highlights if exceeds 8 hours)
6. Click **Save as Draft** to save without submitting
7. Click **Submit** when ready for approval

### Employee: Editing a Timesheet

- **Draft timesheets**: Click View → Edit directly
- **Rejected timesheets**: Click View → Edit and resubmit
- **Submitted/Approved**: Read-only, cannot edit

### Employee: Viewing Timesheets

- **My Timesheets** page shows all weeks with:
  - Status badges (Draft/Submitted/Approved/Rejected)
  - Total hours
  - Submission date
- Click any timesheet to view details

### Manager: Approving Timesheets

1. Navigate to **Team Timesheets**
2. List shows pending (submitted/rejected) from your team
3. Click to expand a timesheet
4. Review timesheet grid and daily totals
5. **To Approve**: Click **Approve** button
6. **To Reject**: 
   - Enter rejection reason in text field
   - Click **Reject** button
   - Employee will see reason and can re-edit

---

## API Endpoints

### Employee Operations
```
GET    /timesheets/                    # List all (filtered by role)
POST   /timesheets/                    # Create new
GET    /timesheets/{id}/               # View single
PATCH  /timesheets/{id}/               # Update (draft/rejected)
DELETE /timesheets/{id}/               # Delete soft delete
GET    /timesheets/my_timesheets/      # My timesheets
POST   /timesheets/{id}/submit/        # Submit for approval
```

### Manager Operations
```
POST   /timesheets/{id}/approve/       # Approve (body: {"action": "approve"})
POST   /timesheets/{id}/reject/        # Reject (body: {"action": "reject", "rejection_reason": "..."})
GET    /timesheets/team/               # Team timesheets
```

---

## Data Structures

### Create/Update Timesheet
```json
{
  "week_start": "2025-01-05",
  "week_end": "2025-01-11",
  "rows": [
    {
      "project": "project-uuid",
      "task_description": "Development of feature X",
      "sun_hours": 0,
      "mon_hours": 8,
      "tue_hours": 8,
      "wed_hours": 8,
      "thu_hours": 8,
      "fri_hours": 6,
      "sat_hours": 0
    }
  ]
}
```

### Timesheet Response
```json
{
  "id": "ts-uuid",
  "employee": "emp-uuid",
  "employee_id": "EMP-001",
  "employee_name": "John Doe",
  "week_start": "2025-01-05",
  "week_end": "2025-01-11",
  "status": "submitted",
  "total_hours": 38.00,
  "submitted_at": "2025-01-13T10:30:00Z",
  "approved_at": null,
  "approved_by": null,
  "approved_by_name": null,
  "rejection_reason": null,
  "daily_totals": {
    "Sunday": 0,
    "Monday": 8,
    "Tuesday": 8,
    "Wednesday": 8,
    "Thursday": 8,
    "Friday": 6,
    "Saturday": 0
  },
  "rows": [
    {
      "id": "row-uuid",
      "project": "proj-uuid",
      "project_name": "Client X",
      "project_client": "Acme Corp",
      "task_description": "Development of feature X",
      "sun_hours": 0,
      "mon_hours": 8,
      "tue_hours": 8,
      "wed_hours": 8,
      "thu_hours": 8,
      "fri_hours": 6,
      "sat_hours": 0,
      "row_total": 38.00
    }
  ]
}
```

---

## Status Workflow

```
┌─────────┐
│  DRAFT  │─── Save/Edit ───┐
└────┬────┘                 │
     │                      │
     │ Submit               │
     │                      │
     ▼                      │
┌──────────┐                │
│SUBMITTED │◄── Reject ─────┤
└────┬─────┘                │
     │                      │
     ├─ Approve ───→ ┌─────────┐
     │               │APPROVED │
     │               └─────────┘
     │
     └─ Reject ────→ ┌──────────┐
                     │ REJECTED │──┐
                     └──────────┘  │
                                   │
                        Back to DRAFT
```

---

## Validation Rules

### Daily Hours
- **Maximum 8 hours per day** (across all project rows)
- Grid shows daily totals at bottom
- **RED background** if exceeds 8 hours

### Timesheet
- **Minimum 1 row** required
- **Project field** required
- **Task description** free text (any content)
- All daily hour fields are optional (default 0)

### Status Changes
- **Draft only**: Can edit/delete
- **Submitted**: Only manager can change (approve/reject)
- **Rejected**: Employee can re-edit and resubmit
- **Approved**: Read-only (locked)

---

## Key Files

**Backend**
- `apps/backend/timesheets/models.py` - Data models
- `apps/backend/timesheets/serializers.py` - API serializers
- `apps/backend/timesheets/views.py` - API endpoints
- `apps/backend/timesheets/admin.py` - Admin interface

**Frontend**
- `apps/frontend/src/modules/timesheets/services/timesheetApi.ts` - API client
- `apps/frontend/src/modules/timesheets/hooks/useTimesheets.ts` - React hooks
- `apps/frontend/src/modules/timesheets/pages/TimesheetListPage.tsx` - List view
- `apps/frontend/src/modules/timesheets/pages/TimesheetPage.tsx` - Entry/edit view
- `apps/frontend/src/modules/timesheets/pages/TeamTimesheetsPage.tsx` - Manager approval

**Shared**
- `packages/shared/src/types/timesheet.ts` - TypeScript types

---

## Troubleshooting

### Issue: Cannot edit timesheet
- **Cause**: Status is submitted or approved
- **Solution**: Only draft and rejected timesheets can be edited

### Issue: Cannot submit - "exceeds 8 hours"
- **Cause**: One or more days has total > 8 hours
- **Solution**: Reduce hours in that day across all rows

### Issue: Manager cannot see team timesheets
- **Cause**: User doesn't have "reporting_manager" role
- **Solution**: Assign reporting_manager role in admin panel

### Issue: Cannot approve as manager
- **Cause**: Not the direct reporting manager
- **Solution**: Timesheet employee's reporting_manager must match current user

---

## Performance Notes

- Timesheet list uses pagination
- React Query caching: 5 minute stale time
- Nested row serialization for single API call
- Soft deletes maintain audit trail
- Indexes on employee and status for quick filtering

---

## Future Enhancements

- [ ] Bulk approve/reject for managers
- [ ] Email notifications on approval/rejection
- [ ] Timesheet templates
- [ ] Holiday and leave day blocking
- [ ] Billable hours tracking
- [ ] Timesheet export (PDF/Excel)
- [ ] Week-by-week navigation in UI
- [ ] Mobile optimization for grid view

