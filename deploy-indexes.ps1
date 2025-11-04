# Script para desplegar índices de Firestore

Write-Host "Desplegando índices de Firestore..." -ForegroundColor Cyan

firebase deploy --only firestore:indexes

Write-Host "`n✅ Índices desplegados!" -ForegroundColor Green
Write-Host "Nota: Los índices pueden tardar unos minutos en estar disponibles." -ForegroundColor Yellow
