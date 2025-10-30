# Fix hydration error in DonCandidoChat.tsx
$file = "src/components/ia/DonCandidoChat.tsx"
$content = Get-Content $file -Raw

# Replace <p> with <div> for message content
$content = $content -replace '<p className="text-sm whitespace-pre-wrap leading-relaxed">', '<div className="text-sm whitespace-pre-wrap leading-relaxed">'
$content = $content -replace '\{msg\.contenido\}</p>', '{msg.contenido}</div>'

Set-Content $file $content -NoNewline

Write-Host "Fixed hydration error in DonCandidoChat.tsx" -ForegroundColor Green
