"""
Employee models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from common.models import SoftDeleteModel

User = get_user_model()

EMPLOYMENT_TYPE_CHOICES = (
    ('full_time', 'Full Time'),
    ('contract', 'Contract'),
    ('part_time', 'Part Time'),
    ('intern', 'Intern'),
)


class Employee(SoftDeleteModel):
    """Employee model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    job_role = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES)
    date_of_joining = models.DateField()
    contract_end_date = models.DateField(null=True, blank=True)
    reporting_manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates'
    )

    class Meta:
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f'{self.employee_id} - {self.user.email}'

