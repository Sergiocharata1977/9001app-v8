# Script to clean users and personnel data
# This will delete all users from Firebase Auth and Firestore

Write-Host "⚠️  WARNING: This will delete ALL users and personnel data!" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🧹 Starting cleanup..." -ForegroundColor Cyan
Write-Host ""

# Run the cleanup script
npx tsx src/scripts/clean-users-personnel.ts

Write-Host ""
Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Go to RRHH > Personal and create personnel records" -ForegroundColor White
Write-Host "   2. Register new users (they will be created automatically on first login)" -ForegroundColor White
Write-Host "   3. Go to Admin > Usuarios and assign personnel to users" -ForegroundColor White
Write-Host ""
