# Backend API Contracts

Base URL: /api/v1

## Auth
POST /auth/login
POST /auth/logout
POST /auth/forgot-password

## Employees
GET /employees
GET /employees/{id}
POST /employees
PUT /employees/{id}
DELETE /employees/{id}

## Leaves
GET /leaves
POST /leaves
PUT /leaves/{id}/approve
PUT /leaves/{id}/reject

## Timesheets
GET /timesheets
POST /timesheets
PUT /timesheets/{id}/submit
PUT /timesheets/{id}/approve
PUT /timesheets/{id}/reject

## Projects
GET /projects
POST /projects
PUT /projects/{id}

## Reports
GET /reports/timesheets
GET /reports/leaves
GET /reports/billing

## Audit Logs
GET /audit-logs
