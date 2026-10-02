# Sync web/public from fetched UI tree into this repo (does not touch sandbox paths).
param(
  [string]$UiRoot = "$env:TEMP\tidl-ui-fetched"
)

$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..\web\public")
$src = Join-Path $UiRoot "web\public"
if (-not (Test-Path $src)) {
  Write-Error "Missing $src - run fetch-tidl-health-web.mjs --public-only first."
}
robocopy $src $repo /E /NFL /NDL /NJH /NJS /nc /ns /np
Write-Host "Synced public assets from UI fetch."
