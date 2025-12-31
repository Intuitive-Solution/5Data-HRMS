"""
Timesheet models.
"""
from django.db import models
from django.core.exceptions import ValidationError
from employees.models import Employee
from projects.models import Project
from common.models import SoftDeleteModel
from datetime import datetime, timedelta

TIMESHEET_STATUS_CHOICES = (
    ('draft', 'Draft'),
    ('submitted', 'Submitted'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)


class Timesheet(SoftDeleteModel):
    """Timesheet model - represents a week's timesheet within a month."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='timesheets')
    week_start = models.DateField()
    week_end = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=TIMESHEET_STATUS_CHOICES,
        default='draft'
    )
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_timesheets'
    )
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-week_start']
        unique_together = ('employee', 'week_start')
        indexes = [
            models.Index(fields=['employee', 'week_start']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.employee.employee_id} - {self.week_start} to {self.week_end}'

    def calculate_total_hours(self):
        """Calculate total hours from all rows."""
        total = 0
        for row in self.rows.all():
            total += (
                row.sun_hours + row.mon_hours + row.tue_hours +
                row.wed_hours + row.thu_hours + row.fri_hours + row.sat_hours
            )
        self.total_hours = total
        return total

    def get_daily_totals(self):
        """Get sum of hours for each day of the week."""
        days = ['sun_hours', 'mon_hours', 'tue_hours', 'wed_hours', 'thu_hours', 'fri_hours', 'sat_hours']
        day_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        totals = {}
        
        for day_field, day_label in zip(days, day_labels):
            total = sum(getattr(row, day_field, 0) for row in self.rows.all())
            totals[day_label] = total
        
        return totals

    def validate_daily_hours(self):
        """Validate that no day exceeds 8 hours total."""
        daily_totals = self.get_daily_totals()
        for day, total in daily_totals.items():
            if total > 8:
                raise ValidationError(f'{day} has {total} hours. Maximum allowed is 8 hours per day.')


class TimesheetRow(models.Model):
    """Timesheet row model - represents a project/task row with daily hours."""
    timesheet = models.ForeignKey(Timesheet, on_delete=models.CASCADE, related_name='rows')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    task_description = models.CharField(max_length=255)
    
    # Daily hours (Sun-Sat)
    sun_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    mon_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    tue_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    wed_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    thu_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    fri_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    sat_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        unique_together = ('timesheet', 'project', 'task_description')
        indexes = [
            models.Index(fields=['timesheet']),
            models.Index(fields=['project']),
        ]

    def __str__(self):
        return f'{self.timesheet} - {self.project.name} - {self.task_description}'

    def get_row_total(self):
        """Get total hours for this row."""
        return (
            self.sun_hours + self.mon_hours + self.tue_hours +
            self.wed_hours + self.thu_hours + self.fri_hours + self.sat_hours
        )


def get_month_weeks(year, month):
    """
    Calculate week boundaries for a given month (month-bounded weeks).
    
    Week structure (Sunday is start of week):
    - Week 1: 1st of month to first Saturday (may be partial)
    - Week 2-4: Sunday to Saturday (full weeks)
    - Week 5: Next Sunday to Saturday (or end of month if shorter)
    - Week 6: Remaining days after Week 5 (if any)
    
    Example for December 2025:
    - Week 1: Mon 01/12 → Sat 06/12
    - Week 2: Sun 07/12 → Sat 13/12
    - Week 3: Sun 14/12 → Sat 20/12
    - Week 4: Sun 21/12 → Sat 27/12
    - Week 5: Sun 28/12 → Wed 31/12
    
    Example for November 2025:
    - Week 1: Sat 01/11 → Sat 01/11
    - Week 2: Sun 02/11 → Sat 08/11
    - Week 3: Sun 09/11 → Sat 15/11
    - Week 4: Sun 16/11 → Sat 22/11
    - Week 5: Sun 23/11 → Sat 29/11
    - Week 6: Sun 30/11 → Sun 30/11
    
    Returns: List of tuples (week_start, week_end)
    """
    import calendar
    
    # Get the first and last day of the month
    first_day = datetime(year, month, 1)
    last_day = datetime(year, month, calendar.monthrange(year, month)[1])
    
    weeks = []
    current_date = first_day
    week_count = 0
    
    # Build weeks 1-4
    while current_date <= last_day and week_count < 4:
        week_count += 1
        
        # Calculate the end of this week (Saturday)
        # weekday() returns 0=Monday, 1=Tuesday, ..., 5=Saturday, 6=Sunday
        # We want days until Saturday (5)
        days_until_saturday = (5 - current_date.weekday()) % 7
        if days_until_saturday == 0 and current_date.weekday() != 5:
            # If we're on a Sunday (6), we need 6 days to Saturday
            days_until_saturday = 6
        
        week_end = current_date + timedelta(days=days_until_saturday)
        
        # Cap week_end to end of month
        if week_end > last_day:
            week_end = last_day
        
        weeks.append((current_date.date(), week_end.date()))
        
        # Move to next Sunday
        current_date = week_end + timedelta(days=1)
    
    # Handle Week 5: if there are remaining days after Week 4
    if current_date <= last_day:
        # Calculate days until Saturday for Week 5
        days_until_saturday = (5 - current_date.weekday()) % 7
        if days_until_saturday == 0 and current_date.weekday() != 5:
            days_until_saturday = 6
        
        week5_end = current_date + timedelta(days=days_until_saturday)
        
        # Cap to end of month
        if week5_end > last_day:
            week5_end = last_day
        
        weeks.append((current_date.date(), week5_end.date()))
        
        # Handle Week 6: if there are remaining days after Week 5
        next_date = week5_end + timedelta(days=1)
        if next_date <= last_day:
            weeks.append((next_date.date(), last_day.date()))
    
    return weeks



