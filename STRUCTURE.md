# Project Structure Documentation

Complete breakdown of the 5Data HRMS monorepo structure.

## Directory Tree

```
5Data-HRMS/
├── docs/                               # Project documentation
│   ├── 00-project-rules.md            # Global rules & standards
│   ├── 01-product-overview.md         # Product overview
│   ├── 02-roles-and-permissions.md    # Role definitions
│   ├── 03-ui-design-system.md         # Design system & colors
│   ├── 04-layout-and-navigation.md    # Layout specifications
│   ├── 05-frontend-architecture-react.md  # Frontend architecture
│   ├── 06-backend-contracts.md        # API contracts
│   ├── 07-modules/                    # Module specifications
│   │   ├── auth.md
│   │   ├── employee.md
│   │   ├── leave.md
│   │   ├── projects.md
│   │   ├── reports.md
│   │   └── timesheet.md
│   └── backend/                       # Backend documentation
│       ├── 00-backend-rules.md
│       ├── 01-backend-overview.md
│       ├── 02-architecture.md
│       ├── 03-authentication-authorization.md
│       ├── 04-data-models.md
│       ├── 05-api-design.md
│       ├── 06-business-rules.md
│       ├── 07-audit-logging.md
│       ├── 08-security-compliance.md
│       └── 09-deployment-config.md
│
├── packages/                          # Shared packages
│   └── shared/                        # Shared types & constants
│       ├── src/
│       │   ├── types/                 # TypeScript type definitions
│       │   │   ├── index.ts
│       │   │   ├── auth.ts            # Auth types
│       │   │   ├── user.ts            # User types
│       │   │   ├── employee.ts        # Employee types
│       │   │   ├── leave.ts           # Leave types
│       │   │   ├── timesheet.ts       # Timesheet types
│       │   │   ├── project.ts         # Project types
│       │   │   └── common.ts          # Common types
│       │   ├── constants/             # Constants
│       │   │   └── index.ts
│       │   └── index.ts               # Main export
│       ├── package.json
│       ├── tsconfig.json
│       └── dist/                      # Compiled output
│
├── apps/                              # Application packages
│   ├── frontend/                      # React + Vite frontend
│   │   ├── src/
│   │   │   ├── app/                   # Main app component
│   │   │   │   └── App.tsx
│   │   │   ├── components/            # Reusable components
│   │   │   │   ├── layout/            # Layout components
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Header.tsx
│   │   │   │   └── common/            # Common components
│   │   │   ├── layouts/               # Page layouts
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── modules/               # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   └── pages/
│   │   │   │   │       └── LoginPage.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── pages/
│   │   │   │   │       └── DashboardPage.tsx
│   │   │   │   ├── employees/         # TODO: Will be created
│   │   │   │   ├── leaves/            # TODO: Will be created
│   │   │   │   ├── timesheets/        # TODO: Will be created
│   │   │   │   └── projects/          # TODO: Will be created
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── services/              # API services
│   │   │   │   ├── api.ts             # Axios instance
│   │   │   │   └── queryClient.ts     # React Query setup
│   │   │   ├── store/                 # Redux state
│   │   │   │   ├── index.ts           # Store config
│   │   │   │   └── slices/
│   │   │   │       └── authSlice.ts   # Auth reducer
│   │   │   ├── utils/                 # Utility functions
│   │   │   ├── index.css              # Global styles
│   │   │   └── main.tsx               # Entry point
│   │   ├── index.html                 # HTML template
│   │   ├── vite.config.ts             # Vite configuration
│   │   ├── tsconfig.json              # TypeScript config
│   │   ├── tailwind.config.js         # Tailwind configuration
│   │   ├── postcss.config.js          # PostCSS configuration
│   │   ├── .eslintrc.cjs              # ESLint configuration
│   │   ├── package.json
│   │   └── dist/                      # Build output
│   │
│   └── backend/                       # Django backend
│       ├── manage.py                  # Django CLI
│       ├── core/                      # Django project settings
│       │   ├── __init__.py
│       │   ├── settings.py            # Django settings
│       │   ├── urls.py                # URL routing
│       │   ├── wsgi.py                # WSGI application
│       │   └── asgi.py                # ASGI application
│       │
│       ├── common/                    # Shared utilities
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # Base models (soft delete)
│       │   ├── serializers.py         # Base serializers
│       │   ├── permissions.py         # Custom permissions
│       │   ├── utils.py               # Utility functions
│       │   ├── exceptions.py          # Custom exceptions
│       │   ├── admin.py
│       │   └── tests.py
│       │
│       ├── accounts/                  # Authentication app
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # User model
│       │   ├── serializers.py         # Auth serializers
│       │   ├── views.py               # Auth endpoints
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── employees/                 # Employee management
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # Employee models
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── leaves/                    # Leave management
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # Leave, LeaveBalance
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── projects/                  # Project management
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # Project, ProjectAssignment
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── timesheets/                # Timesheet management
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # Timesheet, TimesheetEntry
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── reports/                   # Reporting module
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── views.py
│       │   └── urls.py
│       │
│       ├── audit/                     # Audit logging
│       │   ├── __init__.py
│       │   ├── apps.py
│       │   ├── models.py              # AuditLog model
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── admin.py
│       │
│       ├── logs/                      # Application logs
│       │   └── hrms.log
│       │
│       ├── requirements.txt           # Python dependencies
│       ├── pyproject.toml             # Python project config
│       ├── .env                       # Local environment (git ignored)
│       └── venv/                      # Virtual environment (git ignored)
│
├── pnpm-workspace.yaml                # pnpm workspace configuration
├── package.json                       # Root package.json
├── .gitignore                         # Git ignore rules
├── .dockerignore                      # Docker ignore rules
├── README.md                          # Project README
├── SETUP.md                           # Setup guide
├── STRUCTURE.md                       # This file
└── .env.example                       # Example environment file
```

## Key Files Explained

### Root Configuration Files

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Defines pnpm workspaces (monorepo) |
| `package.json` | Root package with workspace scripts |
| `.gitignore` | Files to ignore in git |
| `.env.example` | Example environment variables |
| `README.md` | Project overview & quick start |
| `SETUP.md` | Detailed setup instructions |

### Frontend Key Files

| File | Purpose |
|------|---------|
| `apps/frontend/vite.config.ts` | Vite build & dev configuration |
| `apps/frontend/tsconfig.json` | TypeScript configuration |
| `apps/frontend/tailwind.config.js` | Tailwind CSS configuration |
| `apps/frontend/package.json` | Frontend dependencies |
| `apps/frontend/src/main.tsx` | Application entry point |
| `apps/frontend/src/app/App.tsx` | Main app component with routes |

### Backend Key Files

| File | Purpose |
|------|---------|
| `apps/backend/core/settings.py` | Django configuration |
| `apps/backend/core/urls.py` | URL routing |
| `apps/backend/manage.py` | Django CLI |
| `apps/backend/requirements.txt` | Python dependencies |

### Shared Package

| File | Purpose |
|------|---------|
| `packages/shared/src/types/` | TypeScript type definitions |
| `packages/shared/src/constants/` | Constants & configuration |
| `packages/shared/package.json` | Shared package config |

## Module Organization

### Frontend Modules Structure

```
src/modules/
├── auth/
│   ├── pages/
│   │   └── LoginPage.tsx
│   ├── components/      # Auth-specific components
│   ├── services/        # Auth-specific services
│   └── hooks/           # Auth-specific hooks
│
├── employees/
│   ├── pages/
│   ├── components/
│   └── services/
│
├── leaves/
│   ├── pages/
│   ├── components/
│   └── services/
│
├── timesheets/
│   ├── pages/
│   ├── components/
│   └── services/
│
└── projects/
    ├── pages/
    ├── components/
    └── services/
```

### Backend Django Apps

Each app follows the Django convention:

```
app_name/
├── __init__.py          # Python package marker
├── apps.py              # App configuration
├── models.py            # Database models
├── serializers.py       # DRF serializers
├── views.py             # API endpoints (ViewSets)
├── urls.py              # URL routing
├── admin.py             # Admin interface
├── migrations/          # Database migrations
│   └── __init__.py
└── tests.py             # Tests (optional)
```

## Import Paths

### Frontend

Use path aliases for cleaner imports:

```typescript
// Instead of: import x from '../../services/api'
// Use:
import api from '@/services/api'

// Configured in tsconfig.json:
// "baseUrl": ".",
// "paths": {
//   "@/*": ["src/*"]
// }
```

### Backend

Follow Python conventions:

```python
# Absolute imports from installed packages
from django.db import models
from rest_framework import serializers

# Relative imports within same package
from .models import Employee
from .serializers import EmployeeSerializer

# Absolute imports across apps
from accounts.models import User
from employees.models import Employee
```

## Shared Package Usage

### In Frontend

```typescript
import { 
  USER_ROLES, 
  API_URL, 
  type AuthUser 
} from '@5data-hrms/shared'
```

### In Backend (when integrated)

Python doesn't directly import TS, but the types are for reference.

## Common Patterns

### Adding a New Feature

1. **Backend First:**
   - Create model in `app/models.py`
   - Create serializer in `app/serializers.py`
   - Create viewset in `app/views.py`
   - Add routes in `app/urls.py`
   - Create migration
   - Register in admin

2. **Frontend:**
   - Create module in `src/modules/feature_name/`
   - Create pages, components, services
   - Add routes to `App.tsx`
   - Add Redux slices if needed

3. **Shared Types:**
   - Add TypeScript types in `packages/shared/src/types/`
   - Add constants in `packages/shared/src/constants/`
   - Export from `packages/shared/src/index.ts`

## Build Outputs

### Frontend Build

```
apps/frontend/dist/
├── index.html
├── assets/
│   ├── index-*.js       # JavaScript bundles
│   └── index-*.css      # CSS bundles
└── vite.svg
```

### Shared Build

```
packages/shared/dist/
├── index.d.ts           # TypeScript declarations
├── index.js             # JavaScript output
└── types/               # Type definitions
```

## Version Control Structure

```
.git/
├── hooks/               # Git hooks
├── objects/             # Git objects
└── refs/                # Git references

Files tracked:
- All source code
- Configuration files
- Documentation

Files ignored:
- node_modules/
- venv/
- __pycache__/
- .env (local)
- dist/ (built files)
- *.log
```

## Environment in Different Contexts

### Development
- DEBUG=True
- ALLOWED_HOSTS=localhost,127.0.0.1
- CORS_ALLOWED_ORIGINS=http://localhost:5173
- Database: local PostgreSQL

### Production
- DEBUG=False
- ALLOWED_HOSTS=yourdomain.com
- CORS_ALLOWED_ORIGINS=https://yourdomain.com
- Database: remote PostgreSQL
- SECURE_SSL_REDIRECT=True

## Performance Considerations

### Frontend
- Code splitting via Vite
- React Query for server caching
- Redux for client state
- Lazy loading routes (can be added)

### Backend
- Database indexing on frequently queried fields
- Pagination on list endpoints
- Query optimization with select_related/prefetch_related
- Connection pooling (can be added)

---

For more details on specific areas, refer to individual documentation files in `/docs`.



