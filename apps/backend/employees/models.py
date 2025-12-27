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

GENDER_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female'),
    ('other', 'Other'),
    ('prefer_not_to_say', 'Prefer not to say'),
)

EMPLOYMENT_STATUS_CHOICES = (
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('on_leave', 'On Leave'),
    ('terminated', 'Terminated'),
)


class Employee(SoftDeleteModel):
    """Employee model."""
    # User Reference
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    employee_id = models.CharField(max_length=50, unique=True)

    # Personal Info Fields
    middle_name = models.CharField(max_length=100, blank=True)
    personal_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    picture = models.ImageField(upload_to='employee_pictures/', blank=True, null=True)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')

    # Job Info Fields
    job_title = models.CharField(max_length=100, default='')
    probation_policy = models.CharField(max_length=100, blank=True)
    reporting_manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates'
    )

    # Work Info Fields
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    shift = models.CharField(max_length=50, blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES)
    date_of_joining = models.DateField()
    contract_end_date = models.DateField(null=True, blank=True)
    contractor_company = models.CharField(max_length=200, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    termination_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
            models.Index(fields=['employment_status']),
        ]

    def __str__(self):
        return f'{self.employee_id} - {self.user.email}'


class EmployeeDocument(SoftDeleteModel):
    """Employee document model for storing employee documents."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='employee_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee']),
            models.Index(fields=['document_type']),
        ]

    def __str__(self):
        return f'{self.name} - {self.employee.employee_id}'

