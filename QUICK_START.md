# 🚀 Quick Start Guide

Get the HRMS system running in 15 minutes.

## Prerequisites Check

```bash
# Verify you have the required tools
node --version    # Should be v18+
python3 --version # Should be 3.11+
pnpm --version    # Should be latest
psql --version    # Should be 13+
```

## Step 1: Navigate to Project (1 min)

```bash
cd /Users/tahiri/Tahir/development/5Data-HRMS
```

## Step 2: Create Database (2 min)

```bash
# Create database and user
createdb hrms_db
createuser hrms_user -P
# When prompted for password, enter: hrms_password
```

**Verify connection:**
```bash
psql -U hrms_user -d hrms_db -c "SELECT 1"
# Should output: 1
```

## Step 3: Setup Environment (2 min)

```bash
# Copy environment template
cp .env.example .env.local

# Generate secrets (run these commands and copy results to .env.local)
python3 -c 'import secrets; print("SECRET_KEY=" + secrets.token_urlsafe(50))'
python3 -c 'import secrets; print("JWT_SECRET=" + secrets.token_urlsafe(50))'
```

**Or use defaults for development** (Not for production!):
```bash
# .env.local should contain:
DEBUG=True
SECRET_KEY=django-insecure-test-key-change-in-production
JWT_SECRET=jwt-test-key-change-in-production
DATABASE_URL=postgresql://hrms_user:hrms_password@localhost:5432/hrms_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Step 4: Install All Dependencies (3 min)

```bash
# Install all workspace packages
pnpm install

# Verify installation
pnpm list --depth=0
```

## Step 5: Setup Backend (4 min)

```bash
cd apps/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Email: admin@example.com
# Password: (enter a secure password)
# First name: Admin
# Last name: User
```

## Step 6: Start Backend (1 min)

```bash
# Make sure you're in apps/backend with venv activated
python manage.py runserver

# You should see:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C.
```

✅ **Backend running on**: `http://localhost:8000`

## Step 7: Start Frontend (1 min)

**In a new terminal:**

```bash
cd apps/frontend

# Start development server
pnpm dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

✅ **Frontend running on**: `http://localhost:5173`

## Step 8: Test the Application (1 min)

### Frontend
1. Open `http://localhost:5173`
2. You should see the login page
3. Try logging in with: `admin@example.com` / (your password)

### Backend Admin
1. Open `http://localhost:8000/admin`
2. Login with superuser credentials
3. Explore the admin interface

### API Test
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Should return:
# {"access":"token...","refresh":"token...","user":{...}}
```

---

## 🎯 You're Done!

Your HRMS system is now running!

### Quick Links
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **Django Admin**: http://localhost:8000/admin

### Next Steps
1. Explore the admin interface
2. Read `README.md` for features
3. Check `docs/` for architecture
4. Start building features!

---

## 🆘 Troubleshooting

### Port Already in Use?

```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
# Or use: python manage.py runserver 8001

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
# Or use: pnpm dev -- --port 5174
```

### Database Connection Error?

```bash
# Verify PostgreSQL is running
pg_isready
# Should return: accepting connections

# Check your .env.local
cat .env.local | grep DATABASE_URL

# Test connection
psql -U hrms_user -d hrms_db
```

### Module Not Found?

```bash
cd apps/frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Python Dependencies Error?

```bash
cd apps/backend
source venv/bin/activate
pip install --no-cache-dir -r requirements.txt
python manage.py runserver
```

---

## 📚 Learn More

| Document | For Learning About |
|----------|-------------------|
| `README.md` | Features & architecture |
| `SETUP.md` | Detailed installation |
| `STRUCTURE.md` | Project structure |
| `CHECKLIST.md` | Verification checklist |
| `docs/` | Detailed specifications |

---

**Everything working?** → Start reading `README.md` for next steps!

**Need help?** → Check `CHECKLIST.md` for common issues.

