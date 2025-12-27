# API Design

Base URL: /api/v1

## Auth
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh

## Employees
GET    /employees
POST   /employees
GET    /employees/{id}
PUT    /employees/{id}
DELETE /employees/{id}

## Leaves
GET    /leaves
POST   /leaves
PUT    /leaves/{id}/approve
PUT    /leaves/{id}/reject

## Timesheets
GET    /timesheets
POST   /timesheets
PUT    /timesheets/{id}/submit
PUT    /timesheets/{id}/approve
PUT    /timesheets/{id}/reject

## Projects
GET    /projects
POST   /projects
PUT    /projects/{id}

## Reports
GET    /reports/timesheets
GET    /reports/leaves
GET    /reports/billing
