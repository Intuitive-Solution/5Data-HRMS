"""
Serializers for the documents app.
"""
from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model."""
    uploaded_by_name = serializers.SerializerMethodField()
    uploaded_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'description',
            'file',
            'file_size',
            'file_type',
            'visible_to',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'file_size',
            'file_type',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_by_email',
            'created_at',
            'updated_at',
        ]

    def get_uploaded_by_name(self, obj):
        """Get the full name of the user who uploaded the document."""
        if obj.uploaded_by:
            full_name = f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip()
            return full_name if full_name else obj.uploaded_by.email.split('@')[0]
        return None

    def get_uploaded_by_email(self, obj):
        """Get the email of the user who uploaded the document."""
        if obj.uploaded_by:
            return obj.uploaded_by.email
        return None


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating documents with file upload."""
    file = serializers.FileField(write_only=True)
    visible_to = serializers.JSONField()

    class Meta:
        model = Document
        fields = [
            'title',
            'description',
            'file',
            'visible_to',
        ]

    def validate_visible_to(self, value):
        """Parse JSON string if needed and validate role names."""
        import json
        
        # Handle JSON string from multipart form data
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for visible_to")
        
        if not isinstance(value, list):
            raise serializers.ValidationError("visible_to must be a list of role names")
        
        valid_roles = [
            'employee',
            'reporting_manager',
            'project_lead',
            'project_manager',
            'hr_user',
            'finance_user',
            'system_admin',
        ]
        
        if not value:
            raise serializers.ValidationError("At least one role must be selected.")
        
        for role in value:
            if role not in valid_roles:
                raise serializers.ValidationError(f"Invalid role: {role}")
        
        return value

    def create(self, validated_data):
        """Create document with file size and type extraction."""
        file = validated_data['file']
        
        # Extract file size and type
        file_size = Document.format_file_size(file.size)
        file_type = Document.get_file_type_from_extension(file.name)
        
        # Add extracted data
        validated_data['file_size'] = file_size
        validated_data['file_type'] = file_type
        validated_data['uploaded_by'] = self.context['request'].user
        
        return super().create(validated_data)


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document listings."""
    uploaded_by_name = serializers.SerializerMethodField()
    uploaded_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'description',
            'file_size',
            'file_type',
            'visible_to',
            'uploaded_by_name',
            'uploaded_by_email',
            'created_at',
        ]

    def get_uploaded_by_name(self, obj):
        """Get the full name of the user who uploaded the document."""
        if obj.uploaded_by:
            full_name = f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip()
            return full_name if full_name else obj.uploaded_by.email.split('@')[0]
        return None

    def get_uploaded_by_email(self, obj):
        """Get the email of the user who uploaded the document."""
        if obj.uploaded_by:
            return obj.uploaded_by.email
        return None


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating document visibility (HR/Admin only)."""
    visible_to = serializers.JSONField()

    class Meta:
        model = Document
        fields = ['visible_to']

    def validate_visible_to(self, value):
        """Parse JSON string if needed and validate role names."""
        import json
        
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for visible_to")
        
        if not isinstance(value, list):
            raise serializers.ValidationError("visible_to must be a list of role names")
        
        valid_roles = [
            'employee',
            'reporting_manager',
            'project_lead',
            'project_manager',
            'hr_user',
            'finance_user',
            'system_admin',
        ]
        
        if not value:
            raise serializers.ValidationError("At least one role must be selected.")
        
        for role in value:
            if role not in valid_roles:
                raise serializers.ValidationError(f"Invalid role: {role}")
        
        return value

