"""
Settings serializers.
"""
from rest_framework import serializers
from .models import Department, Location, Holiday


class DepartmentSerializer(serializers.ModelSerializer):
    """Department serializer."""

    class Meta:
        model = Department
        fields = ('id', 'name', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class LocationSerializer(serializers.ModelSerializer):
    """Location serializer."""

    class Meta:
        model = Location
        fields = ('id', 'name', 'address', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class HolidaySerializer(serializers.ModelSerializer):
    """Holiday serializer."""

    class Meta:
        model = Holiday
        fields = ('id', 'name', 'date', 'is_optional', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CountSerializer(serializers.Serializer):
    """Count response serializer."""
    count = serializers.IntegerField()

