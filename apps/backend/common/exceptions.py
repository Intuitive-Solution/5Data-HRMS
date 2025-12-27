"""
Custom exception classes.
"""
from rest_framework.exceptions import APIException


class BusinessLogicException(APIException):
    """Exception for business logic violations."""
    status_code = 400
    default_detail = 'Business logic error'
    default_code = 'business_error'


class InactiveUserException(BusinessLogicException):
    """User is inactive."""
    default_detail = 'This user account is inactive'
    default_code = 'inactive_user'


class InsufficientLeaveException(BusinessLogicException):
    """Insufficient leave balance."""
    default_detail = 'Insufficient leave balance'
    default_code = 'insufficient_leave'


class InvalidTimesheetException(BusinessLogicException):
    """Invalid timesheet data."""
    default_detail = 'Invalid timesheet data'
    default_code = 'invalid_timesheet'

