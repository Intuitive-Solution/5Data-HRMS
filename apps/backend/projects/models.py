"""
Project models.
"""
from django.db import models
from employees.models import Employee
from common.models import SoftDeleteModel

BILLING_TYPE_CHOICES = (
    ('time_and_material', 'Time & Material'),
    ('fixed_price', 'Fixed Price'),
    ('non_billable', 'Non-Billable'),
)

PROJECT_STATUS_CHOICES = (
    ('active', 'Active'),
    ('paused', 'Paused'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)


class Project(SoftDeleteModel):
    """Project model."""
    name = models.CharField(max_length=255)
    client = models.CharField(max_length=255)
    billing_type = models.CharField(max_length=20, choices=BILLING_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PROJECT_STATUS_CHOICES,
        default='active'
    )
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['client']),
        ]

    def __str__(self):
        return self.name


class ProjectAssignment(models.Model):
    """Project assignment model."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='project_assignments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assignments')
    role = models.CharField(max_length=100)
    assigned_date = models.DateField()
    unassigned_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'project')
        ordering = ['-assigned_date']

    def __str__(self):
        return f'{self.employee.employee_id} - {self.project.name}'



