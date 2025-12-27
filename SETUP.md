# Setup Guide for 5Data HRMS

Detailed installation and configuration instructions for the complete HRMS system.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Applications](#running-the-applications)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

## System Requirements

### Node.js Environment (Frontend)
- **Node.js**: 18.x or higher
- **npm/pnpm**: Latest version
- **Recommended**: Use Node version manager (nvm)

```bash
# Check Node version
node --version

# Install pnpm globally
npm install -g pnpm

# Verify pnpm installation
pnpm --version
```

### Python Environment (Backend)
- **Python**: 3.11 or higher
- **pip**: Package installer for Python
- **Recommended**: Use Python virtual environment

```bash
# Check Python version
python3 --version

# Create virtual environment (in apps/backend)
cd apps/backend
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Database
- **PostgreSQL**: 13 or higher
- **Default**: localhost:5432

```bash
# Check PostgreSQL installation
psql --version
```

## Installation Steps

### 1. Clone Repository

```bash
cd /Users/tahiri/Tahir/development/5Data-HRMS
```

### 2. Install Frontend Dependencies

```bash
# Install all workspace packages (including frontend)
pnpm install

# Or install only frontend
cd apps/frontend
pnpm install
```

### 3. Install Backend Dependencies

```bash
cd apps/backend

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Or using pip-tools
pip install -r requirements.txt
```

### 4. Verify Installation

```bash
# Check frontend packages
pnpm list

# Check backend packages
pip list
```

## Database Setup

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hrms_db;

# Create database user
CREATE USER hrms_user WITH PASSWORD 'hrms_password';

# Grant privileges
ALTER ROLE hrms_user SET client_encoding TO 'utf8';
ALTER ROLE hrms_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hrms_user SET default_transaction_deferrable TO on;
ALTER ROLE hrms_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;

# Exit psql
\q
```

### Alternative: Using createdb (One-liner)

```bash
createdb hrms_db
createuser hrms_user -P  # Prompts for password (enter: hrms_password)
psql -d hrms_db -c "GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;"
```

## Environment Configuration

### 1. Create Environment File

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your configuration
nano .env.local  # or use your preferred editor
```

### 2. Configure Environment Variables

**Database Configuration:**
```
DATABASE_URL=postgresql://hrms_user:hrms_password@localhost:5432/hrms_db
POSTGRES_DB=hrms_db
POSTGRES_USER=hrms_user
POSTGRES_PASSWORD=hrms_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

**Django Configuration:**
```
DEBUG=True  # Change to False in production
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
```

**CORS Configuration:**
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend Configuration:**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

### 3. Generate Secret Keys

```bash
# Generate SECRET_KEY (Django)
python3 -c 'import secrets; print(secrets.token_urlsafe(50))'

# Generate JWT_SECRET (JWT)
python3 -c 'import secrets; print(secrets.token_urlsafe(50))'
```

## Running the Applications

### Backend Setup

```bash
cd apps/backend

# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Follow the prompts:
# Email: admin@example.com
# Password: (enter password)
# First name: Admin
# Last name: User

# Verify database
python manage.py showmigrations
```

### Start Backend Server

```bash
cd apps/backend

# Development server
python manage.py runserver

# Output:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C.
```

**Backend runs on**: `http://localhost:8000`

### Start Frontend Development Server

```bash
# In project root
pnpm frontend:dev

# Or in frontend directory
cd apps/frontend
pnpm dev

# Output:
# ➜  Local:   http://localhost:5173/
```

**Frontend runs on**: `http://localhost:5173`

### Run Both Simultaneously

```bash
# In project root (runs both with pnpm)
pnpm dev

# Or in separate terminals
# Terminal 1: cd apps/backend && python manage.py runserver
# Terminal 2: cd apps/frontend && pnpm dev
```

## Accessing the Application

### Frontend
- **URL**: http://localhost:5173
- **Login**: Use the superuser credentials created

### Django Admin
- **URL**: http://localhost:8000/admin
- **Login**: Use superuser credentials

### API Endpoints
- **Base URL**: http://localhost:8000/api/v1
- **Example**: http://localhost:8000/api/v1/auth/

## Troubleshooting

### Port Already in Use

**Frontend (5173 already in use):**
```bash
cd apps/frontend
pnpm dev -- --port 5174
```

**Backend (8000 already in use):**
```bash
cd apps/backend
python manage.py runserver 8001
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres

# Verify .env.local database URL
cat .env.local | grep DATABASE_URL

# Test connection
psql postgresql://hrms_user:hrms_password@localhost:5432/hrms_db
```

### Python Virtual Environment Issues

```bash
# If venv is corrupted, recreate it
cd apps/backend
rm -rf venv

# Create new virtual environment
python3 -m venv venv

# Activate and reinstall
source venv/bin/activate
pip install -r requirements.txt
```

### Package Installation Issues

**Frontend:**
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
pnpm install
```

**Backend:**
```bash
# Clear pip cache
pip cache purge

# Reinstall requirements
pip install --no-cache-dir -r requirements.txt
```

### Migration Issues

```bash
# Check migration status
python manage.py showmigrations

# Rollback migration (if needed)
python manage.py migrate app_name 0001

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Frontend Build Issues

```bash
# Clear node_modules
rm -rf node_modules
rm pnpm-lock.yaml

# Reinstall
pnpm install

# Try building
pnpm build
```

## Development Workflow

### Making Database Schema Changes

1. **Create a model in Django**
   ```python
   # apps/backend/app_name/models.py
   class NewModel(models.Model):
       field = models.CharField(max_length=100)
   ```

2. **Create migration**
   ```bash
   cd apps/backend
   python manage.py makemigrations
   ```

3. **Review migration** (in `migrations/`)

4. **Apply migration**
   ```bash
   python manage.py migrate
   ```

5. **Update serializers** if needed

### Creating a New API Endpoint

1. **Create model** (if needed)
2. **Create serializer** in `serializers.py`
3. **Create viewset** in `views.py`
4. **Add route** in `urls.py`
5. **Register in admin.py** (for admin access)

### Frontend Feature Development

1. **Create component** in `src/components/`
2. **Add module** in `src/modules/` (if new feature)
3. **Create API service** in `src/services/`
4. **Add route** in `src/app/App.tsx`
5. **Add Redux actions** if state management needed

## Useful Commands

### Frontend

```bash
pnpm frontend:dev        # Start dev server
pnpm frontend:build      # Build for production
pnpm frontend lint       # Lint code
pnpm frontend type-check # TypeScript check
```

### Backend

```bash
python manage.py runserver           # Start dev server
python manage.py makemigrations      # Create migration
python manage.py migrate             # Apply migrations
python manage.py createsuperuser     # Create admin
python manage.py shell               # Python shell
python manage.py test                # Run tests
python manage.py collectstatic       # Collect static files
```

### Database

```bash
psql -U hrms_user -d hrms_db         # Connect to database
\dt                                  # List tables
\d table_name                        # Describe table
SELECT * FROM table_name;            # Query data
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Setup database
3. ✅ Configure environment
4. ✅ Run migrations
5. ✅ Create superuser
6. ✅ Start development servers
7. 📖 Read project documentation in `/docs`
8. 🚀 Start developing features

---

For additional help, refer to:
- [README.md](./README.md) - Project overview
- [docs/](./docs/) - Detailed documentation
- Official docs:
  - [Django Docs](https://docs.djangoproject.com/)
  - [React Docs](https://react.dev/)
  - [Vite Docs](https://vitejs.dev/)
  - [PostgreSQL Docs](https://www.postgresql.org/docs/)

