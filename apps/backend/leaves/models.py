"""
Leave models.
"""
from django.db import models
from employees.models import Employee
from common.models import SoftDeleteModel

LEAVE_TYPE_CHOICES = (
    ('paid_leave', 'Paid Leave'),
    ('sick_leave', 'Sick Leave'),
    ('casual_leave', 'Casual Leave'),
    ('earned_leave', 'Earned Leave'),
    ('unpaid_leave', 'Unpaid Leave'),
)

LEAVE_STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)


class Leave(SoftDeleteModel):
    """Leave model."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    number_of_days = models.DecimalField(max_digits=4, decimal_places=1)
    reason = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=LEAVE_STATUS_CHOICES,
        default='pending'
    )
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['employee', 'start_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.employee.employee_id} - {self.leave_type} ({self.start_date})'


class LeaveAttachment(models.Model):
    """Leave attachment model."""
    leave = models.ForeignKey(Leave, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='leave_attachments/')
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.leave.id} - {self.name}'


class LeaveBalance(models.Model):
    """Leave balance model."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='leave_balance')
    paid_leave = models.DecimalField(max_digits=4, decimal_places=1, default=5)
    sick_leave = models.DecimalField(max_digits=4, decimal_places=1, default=5)
    casual_leave = models.DecimalField(max_digits=4, decimal_places=1, default=5)
    earned_leave = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.employee.employee_id} - Leave Balance'



