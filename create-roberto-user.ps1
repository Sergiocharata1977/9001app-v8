# Script to create Roberto user in Firestore

Write-Host "🔧 Creating Roberto user in Firestore..." -ForegroundColor Cyan
Write-Host ""

# Get the current user UID from Firebase Auth
# You'll need to replace this with Roberto's actual UID

$body = @{
    uid = "REPLACE_WITH_ROBERTO_UID"
    email = "roberto@empresa.com"
} | ConvertTo-Json

Write-Host "Making request to create user..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/create" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ User created successfully!" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error creating user:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "📝 Note: You need to replace REPLACE_WITH_ROBERTO_UID with the actual UID from Firebase Authentication" -ForegroundColor Yellow
