"""
Leave serializers.
"""
from rest_framework import serializers
from .models import Leave, LeaveBalance, LeaveAttachment


class LeaveAttachmentSerializer(serializers.ModelSerializer):
    """Leave attachment serializer."""
    class Meta:
        model = LeaveAttachment
        fields = ('id', 'file', 'name', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class LeaveSerializer(serializers.ModelSerializer):
    """Leave serializer."""
    attachments = LeaveAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Leave
        fields = (
            'id', 'employee', 'leave_type', 'start_date', 'end_date',
            'number_of_days', 'reason', 'status', 'approved_by',
            'approved_at', 'attachments', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'approved_by', 'approved_at', 'created_at', 'updated_at')


class CreateLeaveSerializer(serializers.Serializer):
    """Create leave serializer."""
    leave_type = serializers.ChoiceField(
        choices=['paid_leave', 'sick_leave', 'casual_leave', 'earned_leave', 'unpaid_leave']
    )
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    reason = serializers.CharField(required=False, allow_blank=True)


class LeaveBalanceSerializer(serializers.ModelSerializer):
    """Leave balance serializer."""
    class Meta:
        model = LeaveBalance
        fields = ('paid_leave', 'sick_leave', 'casual_leave', 'earned_leave', 'updated_at')
        read_only_fields = ('updated_at',)



