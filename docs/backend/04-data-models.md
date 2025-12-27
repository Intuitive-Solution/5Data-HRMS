# Core Data Models

## User
- id
- email (unique)
- password
- is_active
- last_login

## Employee
- user (FK)
- employee_id (unique)
- department
- job_role
- employment_type
- date_of_joining
- contract_end_date
- reporting_manager (FK)

## Project
- name
- client
- billing_type
- start_date
- end_date
- status

## Timesheet
- employee (FK)
- project (FK)
- week_start
- status
- total_hours

## TimesheetEntry
- timesheet (FK)
- date
- hours
- task_description

## Leave
- employee (FK)
- leave_type
- start_date
- end_date
- status

## AuditLog
- user
- action
- entity
- timestamp
- metadata
