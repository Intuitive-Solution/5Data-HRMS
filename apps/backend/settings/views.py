"""
Settings views.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Department, Location, Holiday
from .serializers import (
    DepartmentSerializer,
    LocationSerializer,
    HolidaySerializer,
    CountSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """Department viewset with CRUD and count endpoint."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'status', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter departments by status if provided."""
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter in ['active', 'inactive']:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get total count of departments."""
        count = self.get_queryset().count()
        serializer = CountSerializer({'count': count})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete department."""
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LocationViewSet(viewsets.ModelViewSet):
    """Location viewset with CRUD and count endpoint."""
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'code', 'address']
    ordering_fields = ['name', 'code', 'status', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter locations by status if provided."""
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter in ['active', 'inactive']:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get total count of locations."""
        count = self.get_queryset().count()
        serializer = CountSerializer({'count': count})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete location."""
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HolidayViewSet(viewsets.ModelViewSet):
    """Holiday viewset with CRUD and count endpoint."""
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'date', 'is_optional', 'created_at']
    ordering = ['date']

    def get_queryset(self):
        """Filter holidays by year if provided."""
        queryset = super().get_queryset()
        year = self.request.query_params.get('year')
        if year:
            try:
                year = int(year)
                queryset = queryset.filter(date__year=year)
            except (ValueError, TypeError):
                pass
        return queryset

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get total count of holidays."""
        count = self.get_queryset().count()
        serializer = CountSerializer({'count': count})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def years(self, request):
        """Get list of years that have holidays."""
        years = Holiday.objects.values_list('date__year', flat=True).distinct().order_by('-date__year')
        return Response(list(years))

    def destroy(self, request, *args, **kwargs):
        """Soft delete holiday."""
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

