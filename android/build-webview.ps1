$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$webOutput = Join-Path $projectRoot "dist"
$assetOutput = Join-Path $PSScriptRoot "app\src\main\assets\www"

Write-Host "Building the Vite web app..."
Push-Location $projectRoot
try {
    npm run build
} finally {
    Pop-Location
}

if (-not (Test-Path $webOutput)) {
    throw "Vite did not create $webOutput"
}

if (Test-Path $assetOutput) {
    Remove-Item $assetOutput -Recurse -Force
}

New-Item -ItemType Directory -Path $assetOutput -Force | Out-Null
Copy-Item (Join-Path $webOutput "*") $assetOutput -Recurse -Force
Write-Host "Copied web assets to $assetOutput"
