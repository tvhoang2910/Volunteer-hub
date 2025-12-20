# Script to check for unused dependencies
Write-Host "🔍 Checking for unused dependencies..." -ForegroundColor Cyan

# Check if depcheck is installed
if (-not (Get-Command depcheck -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing depcheck..." -ForegroundColor Yellow
    npm install -g depcheck
}

Write-Host "`n📊 Running dependency analysis..." -ForegroundColor Green
depcheck

Write-Host "`n✨ Analysis complete!" -ForegroundColor Green
