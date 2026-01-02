"""
Settings models for departments, locations, and holidays.
"""
from django.db import models
from common.models import SoftDeleteModel

# Status choices for Department and Location
STATUS_CHOICES = (
    ('active', 'Active'),
    ('inactive', 'Inactive'),
)


class Department(SoftDeleteModel):
    """Department model."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, blank=True, default='')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['code']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.name


class Location(SoftDeleteModel):
    """Location model."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['code']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.name


class Holiday(SoftDeleteModel):
    """Holiday model."""
    name = models.CharField(max_length=100)
    date = models.DateField()
    is_optional = models.BooleanField(default=False)

    class Meta:
        ordering = ['date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['is_optional']),
        ]
        unique_together = ['name', 'date']

    def __str__(self):
        return f"{self.name} ({self.date})"

