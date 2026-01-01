"""
Settings models for departments, locations, and holidays.
"""
from django.db import models
from common.models import SoftDeleteModel


class Department(SoftDeleteModel):
    """Department model."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name


class Location(SoftDeleteModel):
    """Location model."""
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
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

