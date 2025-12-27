# Backend Rules – Django HRMS

This is a production-grade enterprise backend.

## Global Rules
- Framework: Django + Django REST Framework
- Language: Python 3.11+
- Database: PostgreSQL
- Auth: JWT (stateless)
- No hard deletes (soft delete only)
- All sensitive actions must be audit logged
- Business rules enforced server-side
- API-first (frontend is a consumer, not controller)
- No logic in serializers that belongs in services
- Use transactions for multi-step operations
- No assumptions beyond documented PRD

If unclear:
- Add TODO
- Do not invent behavior
