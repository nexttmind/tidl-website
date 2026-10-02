# Download TIDL-Health web/public into temp, sync into this repo, retry until complete.
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SyncScript = Join-Path $PSScriptRoot "sync-ui-public.ps1"
$FetchScript = Join-Path $PSScriptRoot "fetch-tidl-health-web.mjs"

function Sync-Public {
  & powershell -NoProfile -ExecutionPolicy Bypass -File $SyncScript
}

Push-Location $RepoRoot
try {
  for ($round = 1; $round -le 20; $round++) {
    Write-Host "`n=== Public download round $round ==="
    node $FetchScript --public-only
    $exit = $LASTEXITCODE
    Sync-Public
    if ($exit -eq 0) {
      Write-Host "Public assets complete."
      break
    }
    Write-Host "Round $round had failures (exit $exit); retrying missing files..."
    Start-Sleep -Seconds 5
  }
} finally {
  Pop-Location
}
