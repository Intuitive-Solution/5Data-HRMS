"""
Views for the documents app with role-based visibility.
"""
from django.http import FileResponse, Http404
from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from common.permissions import IsHROrSystemAdmin
from .models import Document
from .serializers import (
    DocumentSerializer,
    DocumentCreateSerializer,
    DocumentListSerializer,
    DocumentUpdateSerializer,
)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for documents with role-based visibility.
    
    - List/Retrieve: Filtered by user's roles (admin/hr see all)
    - Create/Delete: Admin and HR only
    - Download: Role-based visibility check
    """
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'uploaded_by__first_name', 'uploaded_by__last_name']
    ordering_fields = ['title', 'created_at', 'file_size']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Set permissions based on action.
        - list, retrieve, download: Any authenticated user (filtered by role)
        - create, update, destroy: HR or Admin only
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsHROrSystemAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return DocumentCreateSerializer
        elif self.action == 'list':
            return DocumentListSerializer
        elif self.action in ['update', 'partial_update']:
            return DocumentUpdateSerializer
        return DocumentSerializer

    def get_queryset(self):
        """
        Filter documents based on user's roles.
        
        - Admin/HR: See all documents
        - Others: See only documents where their role is in visible_to
        """
        user = self.request.user
        user_roles = user.get_role_names()
        
        # Start with non-deleted documents
        queryset = Document.objects.all()
        
        # Admin and HR can see all documents
        if 'system_admin' in user_roles or 'hr_user' in user_roles:
            return queryset
        
        # Build filter for documents visible to user's roles
        # JSONField contains check: visible_to contains any of user's roles
        role_filters = Q()
        for role in user_roles:
            role_filters |= Q(visible_to__contains=role)
        
        return queryset.filter(role_filters)

    def perform_destroy(self, instance):
        """Soft delete the document."""
        instance.soft_delete()

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """
        Download a document file.
        
        Checks role-based visibility before serving the file.
        Returns 403 if user is not authorized.
        """
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404("Document not found")
        
        # Check visibility
        if not document.is_visible_to_user(request.user):
            return Response(
                {"detail": "You do not have permission to access this document."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Serve the file
        try:
            response = FileResponse(
                document.file.open('rb'),
                as_attachment=True,
                filename=document.file.name.split('/')[-1]
            )
            return response
        except FileNotFoundError:
            raise Http404("File not found on server")
