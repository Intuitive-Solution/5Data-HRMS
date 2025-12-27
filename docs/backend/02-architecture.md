# Backend Architecture

## Stack
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Architectural Style
- Layered architecture
- Service-oriented business logic
- Thin views, fat services

## Structure
backend/
 ├── core/
 ├── accounts/
 ├── employees/
 ├── leaves/
 ├── projects/
 ├── timesheets/
 ├── reports/
 ├── audit/
 └── common/

## Principles
- Views handle HTTP
- Services handle business logic
- Models handle persistence
- Serializers handle validation
