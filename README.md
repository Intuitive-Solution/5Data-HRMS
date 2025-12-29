# 5Data HRMS - Enterprise HRMS & Timesheet Management System

A production-grade, scalable monorepo for managing employee lifecycle, leave management, project allocation, and timesheet workflows.

## 🏗️ Architecture Overview

This is a **monorepo** using `pnpm` workspaces with:

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Django + Django REST Framework + PostgreSQL
- **Shared**: Common types, constants, and utilities
- **Package Manager**: pnpm
- **Authentication**: JWT-based (stateless)
- **Database**: PostgreSQL

```
5Data-HRMS/
├── apps/
│   ├── frontend/          # React + Vite + TypeScript
│   └── backend/           # Django + DRF
├── packages/
│   └── shared/            # Shared types & constants
├── docs/                  # Project documentation
├── pnpm-workspace.yaml    # Workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 13+
- pnpm (install via `npm install -g pnpm`)

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/tahiri/Tahir/development/5Data-HRMS
   ```

2. **Install all dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Setup PostgreSQL Database**
   ```bash
   createdb hrms_db
   createuser hrms_user -P  # Set password to: hrms_password
   ```

5. **Run backend migrations**
   ```bash
   cd apps/backend
   python manage.py migrate
   ```

6. **Create superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

## 📦 Running the Applications

### Frontend Development

```bash
pnpm frontend:dev
```

Runs on `http://localhost:5173`

### Backend Development

```bash
# In apps/backend directory
python manage.py runserver
```

Runs on `http://localhost:8000`

### Run Both Together

```bash
pnpm dev
```

## 📂 Project Structure

### Frontend (`apps/frontend/`)

```
src/
├── app/                  # Main app component
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── common/          # Common components
├── layouts/             # Page layouts
├── modules/             # Feature modules (auth, dashboard, etc.)
├── hooks/               # Custom React hooks
├── services/            # API services & utilities
├── store/               # Redux state management
└── utils/               # Utility functions
```

**Key Technologies:**
- React Query for server state
- Redux Toolkit for global state
- React Router v6 for routing
- Tailwind CSS for styling
- Heroicons for icons

### Backend (`apps/backend/`)

```
├── core/                # Django project settings
├── common/              # Shared utilities & base models
├── accounts/            # User authentication
├── employees/           # Employee management
├── leaves/              # Leave management
├── projects/            # Project management
├── timesheets/          # Timesheet management
├── reports/             # Reporting module
└── audit/               # Audit logging
```

**Architecture:**
- **Thin Views**: Handle HTTP only
- **Fat Services**: Business logic
- **Soft Deletes**: Never hard delete data
- **JWT Auth**: Stateless authentication
- **Audit Logging**: All sensitive actions logged

### Shared Package (`packages/shared/`)

Common types and constants used across frontend and backend:

```
src/
├── types/               # TypeScript types
│   ├── auth.ts
│   ├── user.ts
│   ├── employee.ts
│   ├── leave.ts
│   ├── timesheet.ts
│   ├── project.ts
│   └── common.ts
└── constants/
    └── index.ts         # Constants & configuration
```

## 🔐 Authentication Flow

1. **Login**: POST `/api/v1/auth/login`
   - Returns `access` and `refresh` tokens
   - Tokens stored in localStorage
   
2. **API Requests**: Include `Authorization: Bearer {access_token}` header

3. **Token Refresh**: POST `/api/v1/auth/refresh`
   - Auto-refreshed on 401 response
   - Refresh token valid for 7 days

4. **Logout**: POST `/api/v1/auth/logout`
   - Clears tokens

## 👥 User Roles & Permissions

The system supports 7 roles:

- **Employee**: Base user role
- **Reporting Manager**: Can approve subordinate's leaves/timesheets
- **Project Lead**: Can manage project assignments
- **Project Manager**: Can manage projects
- **HR User**: Can manage employees, view reports
- **Finance User**: Can view billing reports
- **System Admin**: Full system access

**Access Control:**
- Enforced at API level (not just frontend)
- Role-based access via JWT claims
- Project-specific assignments for managers

## 📊 Key Modules

### Authentication
- Login/Logout
- JWT token management
- Password change
- Audit logging on login

### Employee Management
- Create/update/view employees
- Hierarchical structure (reporting managers)
- Soft delete (inactive employees)
- Employment types (Full-time, Contract, Part-time, Intern)

### Leave Management
- Apply for leaves
- Leave approval workflow
- Leave balance tracking
  - Sick leave: 5/year
  - Casual leave: 5/year
  - Earned leave: 1.5/month (usable after 1 year)

### Timesheet Management
- Weekly timesheet submission
- Multiple projects per week
- Max 8 hours/day, 40 hours/week
- Approval workflow
- Rejection handling

### Project Management
- Create/manage projects
- Assign employees to projects
- Billing types: Time & Material, Fixed Price, Non-billable

### Reporting
- Timesheet reports
- Leave utilization
- Billing reports

### Audit Logging
- Immutable logs
- All sensitive actions tracked
- Admin-only access

## 🛠️ Development

### Code Quality

```bash
# Lint frontend
pnpm frontend lint

# Format frontend
pnpm frontend lint --fix

# Type check
pnpm frontend type-check

# Run backend tests
cd apps/backend && python manage.py test
```

### Making API Requests from Frontend

```typescript
import api from '@/services/api'

// GET request
const response = await api.get('/employees/')

// POST request
const response = await api.post('/employees/', {
  email: 'user@example.com',
  // ... other fields
})

// Error handling
try {
  await api.post('/endpoint', data)
} catch (error) {
  console.error(error.response?.data)
}
```

### Creating New Features

**Backend:**
1. Create models in `app/models.py`
2. Create serializers in `app/serializers.py`
3. Create viewsets in `app/views.py`
4. Add routes in `app/urls.py`
5. Run migrations: `python manage.py makemigrations && python manage.py migrate`

**Frontend:**
1. Create components in `src/components/`
2. Create module structure in `src/modules/`
3. Add API calls in `src/services/`
4. Add routes to `src/app/App.tsx`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8000/api/v1`
- Production: Configure via environment variables

### Authentication Endpoints
```
POST   /auth/login                # Login
POST   /auth/logout               # Logout
POST   /auth/refresh              # Refresh token
POST   /auth/change-password      # Change password
GET    /auth/me                   # Get current user
```

### Employee Endpoints
```
GET    /employees                 # List employees
POST   /employees                 # Create employee
GET    /employees/{id}            # Get employee details
PUT    /employees/{id}            # Update employee
DELETE /employees/{id}            # Soft delete employee
GET    /employees/me              # Get current user's profile
```

### Leave Endpoints
```
GET    /leaves                    # List leaves
POST   /leaves                    # Apply for leave
GET    /leaves/{id}               # Get leave details
PUT    /leaves/{id}/approve       # Approve leave
PUT    /leaves/{id}/reject        # Reject leave
GET    /leaves/balance            # Get leave balance
GET    /leaves/my_leaves          # Get my leaves
```

### Timesheet Endpoints
```
GET    /timesheets                # List timesheets
POST   /timesheets                # Create timesheet
GET    /timesheets/{id}           # Get timesheet details
PUT    /timesheets/{id}           # Update timesheet
PUT    /timesheets/{id}/submit    # Submit timesheet
PUT    /timesheets/{id}/approve   # Approve timesheet
PUT    /timesheets/{id}/reject    # Reject timesheet
GET    /timesheets/my_timesheets  # Get my timesheets
```

### Project Endpoints
```
GET    /projects                  # List projects
POST   /projects                  # Create project
GET    /projects/{id}             # Get project details
PUT    /projects/{id}             # Update project
GET    /projects/assignments      # List assignments
```

### Report Endpoints
```
GET    /reports/timesheets        # Timesheet report
GET    /reports/leaves            # Leave report
GET    /reports/billing           # Billing report
```

### Audit Endpoints
```
GET    /audit-logs                # List audit logs (admin only)
```

## 🗄️ Database Models

### User
- email (unique)
- password (hashed)
- is_active
- first_name, last_name
- last_login

### Employee
- user (FK)
- employee_id (unique)
- department
- job_role
- employment_type
- date_of_joining
- reporting_manager (self-referential FK)

### Leave
- employee (FK)
- leave_type
- start_date, end_date
- number_of_days
- status (pending/approved/rejected)
- approved_by (FK)

### Timesheet
- employee (FK)
- week_start, week_end
- status (draft/submitted/approved/rejected)
- total_hours

### Project
- name, client
- billing_type
- start_date, end_date
- status

### AuditLog
- user (FK)
- action
- entity, entity_id
- timestamp, ip_address
- metadata (JSON)

## 🔒 Security Features

- ✅ JWT authentication (stateless)
- ✅ Password hashing (PBKDF2)
- ✅ CSRF protection
- ✅ SQL injection protection (ORM)
- ✅ Audit logging
- ✅ Soft deletes (no permanent data loss)
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ HTTPS-ready

## 📝 Environment Variables

See `.env.example` for all available options:

```bash
# Django
DEBUG=False
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hrms_db

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## 🐳 Docker Support

*(Optional - can be set up for production)*

The backend is Docker-ready with Gunicorn and Nginx configuration.

## 📈 Production Deployment

1. **Set DEBUG=False** in production
2. **Use environment variables** for all secrets
3. **Configure PostgreSQL** for production
4. **Set ALLOWED_HOSTS** properly
5. **Enable HTTPS** (SECURE_SSL_REDIRECT=True)
6. **Use Gunicorn** for production server
7. **Configure Nginx** as reverse proxy
8. **Set up daily backups** for database

## 🧪 Testing

```bash
# Frontend
pnpm frontend test

# Backend
cd apps/backend && python manage.py test
```

## 📖 Documentation

Detailed documentation is available in `/docs`:

- `00-project-rules.md` - Global rules
- `01-product-overview.md` - Product overview
- `02-roles-and-permissions.md` - Role definitions
- `03-ui-design-system.md` - Design system
- `04-layout-and-navigation.md` - Layout specs
- `05-frontend-architecture-react.md` - Frontend architecture
- `06-backend-contracts.md` - API contracts

Backend docs:
- `backend/00-backend-rules.md` - Backend rules
- `backend/01-backend-overview.md` - Backend overview
- `backend/02-architecture.md` - Architecture
- `backend/03-authentication-authorization.md` - Auth details
- `backend/04-data-models.md` - Data models
- `backend/05-api-design.md` - API design
- `backend/06-business-rules.md` - Business rules
- `backend/07-audit-logging.md` - Audit logging
- `backend/08-security-compliance.md` - Security
- `backend/09-deployment-config.md` - Deployment

## 🤝 Contributing

1. Follow the architecture guidelines
2. No mock data in production code
3. All sensitive actions must be audit logged
4. Business rules enforced server-side
5. Role-based access at API level
6. Soft deletes only

## 📄 License

All rights reserved © 5Data Inc.

## 🆘 Support

For issues, questions, or feature requests, contact the development team.

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0



