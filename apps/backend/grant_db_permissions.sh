#!/bin/bash
# Grant database permissions to hrms_user

echo "Granting database permissions..."

# Try to find psql
PSQL_CMD=""
if command -v psql &> /dev/null; then
    PSQL_CMD="psql"
elif [ -f "/opt/homebrew/bin/psql" ]; then
    PSQL_CMD="/opt/homebrew/bin/psql"
elif [ -f "/usr/local/bin/psql" ]; then
    PSQL_CMD="/usr/local/bin/psql"
elif [ -f "/opt/homebrew/Cellar/postgresql@15/15.15/bin/psql" ]; then
    PSQL_CMD="/opt/homebrew/Cellar/postgresql@15/15.15/bin/psql"
else
    echo "Error: psql not found. Please install PostgreSQL or add it to PATH."
    exit 1
fi

# Get current user (superuser on macOS Homebrew)
SUPERUSER=$(whoami)

echo "Using PostgreSQL superuser: $SUPERUSER"
echo "Using psql: $PSQL_CMD"
echo ""

# Grant permissions
$PSQL_CMD -U $SUPERUSER -d hrms_db -c "GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;" || exit 1
$PSQL_CMD -U $SUPERUSER -d hrms_db -c "GRANT ALL ON SCHEMA public TO hrms_user;" || exit 1
$PSQL_CMD -U $SUPERUSER -d hrms_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hrms_user;" || exit 1

echo ""
echo "✅ Permissions granted successfully!"
echo ""
echo "Now run: python manage.py migrate"

