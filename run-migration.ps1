# Wolf Shield Database Migration Script (PowerShell)
# Run this to apply all migrations to Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WOLF SHIELD - DATABASE MIGRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "IsoFlux@856$"
$connectionString = "postgresql://postgres.qmctxtmmzeutlgegjrnb:IsoFlux%40856%24@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
$migrationFile = "supabase\migrations\20260228200000_wolf_shield_complete_migration.sql"

Write-Host "[1/3] Connecting to Supabase..." -ForegroundColor Yellow

# Check if psql is available
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "" 
    Write-Host "❌ ERROR: PostgreSQL client (psql) not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or use the Supabase SQL Editor: https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Run migration
psql $connectionString -f $migrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ MIGRATION COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test the application: npm run dev" -ForegroundColor White
    Write-Host "2. Verify tables in Supabase Dashboard" -ForegroundColor White
    Write-Host "3. Run CSV import test" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ MIGRATION FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Yellow
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use Supabase SQL Editor" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql" -ForegroundColor Blue
    Write-Host ""
    exit $LASTEXITCODE
}
