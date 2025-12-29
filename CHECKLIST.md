# 5Data HRMS - Setup Checklist & Quick Reference

Complete checklist for setting up and running the HRMS system.

## Pre-Installation Checklist

- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should be v18 or higher
  ```

- [ ] **Python 3.11+** installed
  ```bash
  python3 --version  # Should be 3.11 or higher
  ```

- [ ] **PostgreSQL 13+** installed and running
  ```bash
  psql --version  # Should be 13 or higher
  pg_isready  # Should return "accepting connections"
  ```

- [ ] **pnpm** installed globally
  ```bash
  npm install -g pnpm
  pnpm --version
  ```

- [ ] **Git** configured
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

## Installation Checklist

### 1. Repository Setup

- [ ] Clone/navigate to project directory
  ```bash
  cd /Users/tahiri/Tahir/development/5Data-HRMS
  ```

- [ ] Verify project structure
  ```bash
  ls -la
  # Should show: docs, apps, packages, pnpm-workspace.yaml, package.json, etc.
  ```

### 2. Database Setup

- [ ] Create PostgreSQL database
  ```bash
  createdb hrms_db
  createuser hrms_user -P  # Password: hrms_password
  psql -d hrms_db -c "GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;"
  ```

- [ ] Verify database connection
  ```bash
  psql -U hrms_user -d hrms_db -c "SELECT 1"
  # Should return: 1
  ```

### 3. Environment Configuration

- [ ] Copy environment file
  ```bash
  cp .env.example .env.local
  ```

- [ ] Update `.env.local` with your values:
  - [ ] `SECRET_KEY` - Generate with: `python3 -c 'import secrets; print(secrets.token_urlsafe(50))'`
  - [ ] `JWT_SECRET` - Generate new secret
  - [ ] `DATABASE_URL` - Should be: `postgresql://hrms_user:hrms_password@localhost:5432/hrms_db`
  - [ ] `ALLOWED_HOSTS` - Default: `localhost,127.0.0.1`
  - [ ] `CORS_ALLOWED_ORIGINS` - Default: `http://localhost:5173,http://localhost:3000`

- [ ] Verify environment file
  ```bash
  cat .env.local | grep DATABASE_URL
  # Should show your database URL
  ```

### 4. Frontend Setup

- [ ] Install all dependencies
  ```bash
  pnpm install
  ```

- [ ] Verify frontend installation
  ```bash
  ls apps/frontend/node_modules
  # Should have many packages
  ```

- [ ] Check frontend build
  ```bash
  cd apps/frontend
  pnpm build
  # Should create dist/ directory
  ```

### 5. Backend Setup

- [ ] Create Python virtual environment
  ```bash
  cd apps/backend
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```

- [ ] Install Python dependencies
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Verify Django installation
  ```bash
  python manage.py --version
  # Should show Django version
  ```

- [ ] Run database migrations
  ```bash
  python manage.py migrate
  # Should show: "Running migrations..." and complete without errors
  ```

- [ ] Create superuser
  ```bash
  python manage.py createsuperuser
  # Email: admin@example.com
  # First name: Admin
  # Last name: User
  # Password: (secure password)
  ```

- [ ] Verify admin interface
  ```bash
  python manage.py check
  # Should show: "System check identified no issues (0 silenced)."
  ```

## Running the Application

### Terminal 1: Backend

```bash
cd apps/backend
source venv/bin/activate  # Activate virtual environment
python manage.py runserver
# Should show: "Starting development server at http://127.0.0.1:8000/"
```

✅ **Backend accessible at**: `http://localhost:8000`

### Terminal 2: Frontend

```bash
cd apps/frontend
pnpm dev
# Should show: "Local: http://localhost:5173/"
```

✅ **Frontend accessible at**: `http://localhost:5173`

## Post-Installation Verification

### Frontend Checks

- [ ] Navigate to `http://localhost:5173`
- [ ] See login page
- [ ] Page loads without console errors
- [ ] Tailwind styling applied (blue colors visible)

### Backend Checks

- [ ] Navigate to `http://localhost:8000/admin`
- [ ] Login with superuser credentials
- [ ] See Django admin interface
- [ ] Check "Users" section - your superuser should be listed

### API Checks

- [ ] Test login endpoint
  ```bash
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"your_password"}'
  ```
  Should return tokens and user info

- [ ] Test with access token
  ```bash
  # Use the access token from above
  curl http://localhost:8000/api/v1/auth/me \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```
  Should return your user info

### Database Checks

- [ ] Connect to database
  ```bash
  psql -U hrms_user -d hrms_db
  ```

- [ ] List tables
  ```sql
  \dt
  # Should show: auth_user, employees_employee, leaves_leave, etc.
  ```

- [ ] Check users
  ```sql
  SELECT id, email, first_name, last_name FROM accounts_user;
  # Should show your superuser
  ```

- [ ] Exit psql
  ```
  \q
  ```

## Common Issues & Solutions

### Issue: "Port 5173 already in use"
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use different port
cd apps/frontend && pnpm dev -- --port 5174
```

### Issue: "Port 8000 already in use"
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
# Or use different port
python manage.py runserver 8001
```

### Issue: "Cannot connect to database"
```bash
# Verify PostgreSQL is running
pg_isready
# Should return: "accepting connections"

# Check .env.local DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test connection directly
psql postgresql://hrms_user:hrms_password@localhost:5432/hrms_db
```

### Issue: "Module not found" in frontend
```bash
cd apps/frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Issue: "Python module not found" in backend
```bash
cd apps/backend
source venv/bin/activate
pip install --no-cache-dir -r requirements.txt
python manage.py runserver
```

### Issue: "Migration not applied"
```bash
cd apps/backend
python manage.py showmigrations
python manage.py migrate --run-syncdb
python manage.py migrate
```

## Development Quick Commands

### Frontend
```bash
pnpm frontend:dev          # Start dev server
pnpm frontend:build        # Build for production
pnpm frontend lint         # Lint code
pnpm frontend type-check   # Check types
```

### Backend
```bash
python manage.py runserver              # Start dev server
python manage.py makemigrations         # Create migration
python manage.py migrate                # Apply migrations
python manage.py createsuperuser        # Create admin user
python manage.py test                   # Run tests
python manage.py shell                  # Interactive Python shell
```

### Database
```bash
psql -U hrms_user -d hrms_db           # Connect to database
\dt                                     # List tables
\d+ table_name                          # Describe table
SELECT * FROM table_name LIMIT 10;      # Query data
```

## Key Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview & features |
| `SETUP.md` | Detailed installation guide |
| `STRUCTURE.md` | Project structure breakdown |
| `docs/` | Detailed specifications |
| `docs/backend/` | Backend architecture & rules |

## Useful URLs

### Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |
| API Auth | http://localhost:8000/api/v1/auth/ |

### Default Credentials

| Service | Email | Password |
|---------|-------|----------|
| Frontend/Admin | `admin@example.com` | (your choice) |
| Django Admin | `admin@example.com` | (your choice) |

## Performance Tips

### Frontend
- Use React Query for caching
- Use Redux for complex state
- Lazy load routes for better code splitting
- Use Tailwind's production build in `.env`

### Backend
- Use `select_related()` for ForeignKey queries
- Use `prefetch_related()` for reverse relations
- Add database indexes on frequently queried fields
- Enable query logging in development with `LOGGING`

## Security Reminders

⚠️ **Before Production:**

1. [ ] Change `SECRET_KEY` to a secure random value
2. [ ] Change `JWT_SECRET` to a secure random value
3. [ ] Set `DEBUG=False`
4. [ ] Update `ALLOWED_HOSTS` to your domain
5. [ ] Update `CORS_ALLOWED_ORIGINS` to your domain
6. [ ] Enable `SECURE_SSL_REDIRECT=True`
7. [ ] Set `SESSION_COOKIE_SECURE=True`
8. [ ] Set `CSRF_COOKIE_SECURE=True`
9. [ ] Use strong superuser password
10. [ ] Configure proper email backend

## File Permissions

```bash
# Ensure proper permissions
chmod 755 apps/backend/manage.py
chmod 755 apps/frontend/node_modules/.bin/*

# If issues with venv
chmod -R 755 apps/backend/venv/bin/
```

## Next Steps

1. ✅ **Complete Installation** - Follow the checklist above
2. ✅ **Run Both Servers** - Terminal 1: Backend, Terminal 2: Frontend
3. ✅ **Test Login** - Access frontend and login
4. ✅ **Explore Admin** - Check Django admin interface
5. 📖 **Read Documentation** - Understand architecture
6. 🚀 **Start Development** - Create features following patterns
7. 🧪 **Write Tests** - Test your code
8. 📦 **Deploy** - Follow deployment guide

## Support & Debugging

### Enable Verbose Logging

**Frontend:**
```typescript
// Set in .env or import
import { enableLogging } from '@/utils/logger'
enableLogging(true)
```

**Backend:**
```python
# In settings.py, adjust LOGGING section
LOGGING['root']['level'] = 'DEBUG'
```

### Check Application Health

```bash
# Backend health check
curl http://localhost:8000/admin/

# Frontend build check
ls apps/frontend/dist/

# Database check
psql -U hrms_user -d hrms_db -c "SELECT COUNT(*) FROM accounts_user;"
```

## Useful Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pnpm Documentation](https://pnpm.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0

For additional help, see:
- [`README.md`](./README.md) - Project overview
- [`SETUP.md`](./SETUP.md) - Detailed setup guide
- [`STRUCTURE.md`](./STRUCTURE.md) - Directory structure
- [`docs/`](./docs/) - Detailed documentation



