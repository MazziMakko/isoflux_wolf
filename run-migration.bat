@echo off
REM Wolf Shield Database Migration Script
REM Run this to apply all migrations to Supabase

echo ========================================
echo WOLF SHIELD - DATABASE MIGRATION
echo ========================================
echo.

set PGPASSWORD=IsoFlux@856$

echo [1/3] Connecting to Supabase...
psql "postgresql://postgres.qmctxtmmzeutlgegjrnb:IsoFlux%%40856%%24@aws-0-us-east-1.pooler.supabase.com:5432/postgres" -f "supabase\migrations\20260228200000_wolf_shield_complete_migration.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ MIGRATION COMPLETE
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Test the application: npm run dev
    echo 2. Verify tables in Supabase Dashboard
    echo 3. Run CSV import test
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ MIGRATION FAILED
    echo ========================================
    echo.
    echo Error code: %ERRORLEVEL%
    echo Check the error messages above.
    echo.
)

pause
