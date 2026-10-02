# Import UI from TIDL-Health/website into this repo WITHOUT overwriting PrescribeRx sandbox.
# Usage (after cloning UI repo to a local path):
#   pwsh ./build/tools/import-ui-from-tidl-health.ps1 -UiRoot "C:\path\to\TIDL-Health-website\web\.."
#
# Do NOT push to TIDL-Health/website. Work only on nexttmind/tidl-website.

param(
  [Parameter(Mandatory = $true)]
  [string]$UiRoot
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$UiRoot = Resolve-Path $UiRoot

# Paths under repo root that must stay from THIS repo (sandbox + portal).
$KeepOurs = @(
  "web\.env.local",
  "web\.env.local.backup-sandbox",
  "web\lib\prescriberx",
  "web\lib\auth",
  "web\app\api\prescriberx",
  "web\app\api\webhooks",
  "web\proxy.ts",
  "web\content\clinical\entry-map.ts",
  "web\components\care\PatientCareActions.tsx",
  "web\components\care\ProtocolCheckout.tsx",
  "web\components\care\ProtocolCheckout.module.css",
  "web\components\care\VisitBooking.tsx",
  "web\lib\prescriberx\care-api-fetch.ts",
  "docs\handoff-patient-portal.md",
  "docs\sandbox-wired.md",
  "docs\sandbox-pm-demo.md",
  "docs\prescriberx-admin-wiring.md",
  "docs\specs\patient-auth.md",
  "docs\specs\clinical-flow.md",
  "build\tools\refresh-prescriberx-sandbox.sh"
)

# Copy these trees from UI (visual / marketing). Care TSX may need manual merge after.
$ImportFromUi = @(
  "web\components\home",
  "web\components\pdp",
  "web\components\category",
  "web\components\marketing",
  "web\components\motion",
  "web\components\brand",
  "web\components\legal",
  "web\components\ai",
  "web\components\chrome",
  "web\public",
  "web\app\page.tsx",
  "web\app\page.module.css",
  "web\app\layout.tsx",
  "web\app\globals.css",
  "web\app\catalog-fields.css",
  "web\app\treatments",
  "web\app\programs",
  "web\app\stacks",
  "web\app\categories",
  "web\app\pain-relief",
  "web\app\faqs",
  "web\app\careers",
  "web\app\guide"
)

function Copy-Tree($Relative) {
  $src = Join-Path $UiRoot $Relative
  $dst = Join-Path $RepoRoot $Relative
  if (-not (Test-Path $src)) {
    Write-Warning "Skip missing UI path: $Relative"
    return
  }
  $parent = Split-Path $dst -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
  Copy-Item -Recurse -Force $src $dst
  Write-Host "Imported $Relative"
}

Write-Host "Repo: $RepoRoot"
Write-Host "UI:   $UiRoot"
Write-Host "Backing up web\.env.local if present..."
$envBackup = Join-Path $RepoRoot "web\.env.local.backup-sandbox"
if (Test-Path (Join-Path $RepoRoot "web\.env.local")) {
  Copy-Item (Join-Path $RepoRoot "web\.env.local") $envBackup -Force
}

foreach ($rel in $ImportFromUi) { Copy-Tree $rel }

# Chrome + care: CSS-only pass from UI where both exist (TSX stays ours unless you merge by hand).
$CssOnly = @(
  "web\components\chrome\SiteHeader.module.css",
  "web\components\care\AccountHome.module.css",
  "web\components\care\AccountWizard.module.css",
  "web\components\care\IntakeWizard.module.css",
  "web\components\care\IntakeFields.module.css",
  "web\components\care\IntakeSplitShell.module.css",
  "web\components\care\ProtocolOrder.module.css",
  "web\components\care\WaitingReview.module.css",
  "web\components\care\CareMoment.module.css",
  "web\components\care\CarePortalChrome.module.css"
)
foreach ($rel in $CssOnly) {
  $src = Join-Path $UiRoot $rel
  $dst = Join-Path $RepoRoot $rel
  if (Test-Path $src) {
    $dir = Split-Path $dst -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Copy-Item -Force $src $dst
    Write-Host "CSS import $rel"
  }
}

Write-Host ""
Write-Host "SANDBOX PATHS NOT TOUCHED (kept from this repo):"
$KeepOurs | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Next: git status, npm run typecheck in web/, restore portal TSX merges for chrome/care if needed."
Write-Host "Restore env: Copy-Item web\.env.local.backup-sandbox web\.env.local -Force"
