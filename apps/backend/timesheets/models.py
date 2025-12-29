"""
Timesheet models.
"""
from django.db import models
from employees.models import Employee
from projects.models import Project
from common.models import SoftDeleteModel

TIMESHEET_STATUS_CHOICES = (
    ('draft', 'Draft'),
    ('submitted', 'Submitted'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)


class Timesheet(SoftDeleteModel):
    """Timesheet model."""
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
        return f'{self.employee.employee_id} - {self.week_start}'


class TimesheetEntry(models.Model):
    """Timesheet entry model."""
    timesheet = models.ForeignKey(Timesheet, on_delete=models.CASCADE, related_name='entries')
    date = models.DateField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    hours = models.DecimalField(max_digits=4, decimal_places=2)
    task_description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']
        unique_together = ('timesheet', 'date', 'project')

    def __str__(self):
        return f'{self.timesheet} - {self.date}'



