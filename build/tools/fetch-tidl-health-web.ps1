# Download web/ tree from TIDL-Health/website at a fixed commit (Windows-safe; no full git checkout).
param(
  [string]$Commit = "cd90f8f8a5d598552c5582461aae63ae5dfee0ca",
  [string]$OutRoot = "$env:TEMP\tidl-ui-fetched",
  [int]$BatchSize = 40,
  [switch]$ImportPathsOnly
)

$ErrorActionPreference = "Stop"
$treePath = Join-Path $env:TEMP "tidl-tree.json"
if (-not (Test-Path $treePath)) {
  Write-Host "Missing $treePath - run gh api to save tidl-tree.json first."
  exit 1
}

$tree = Get-Content $treePath -Raw | ConvertFrom-Json
$blobs = @($tree.tree | Where-Object { $_.path -like "web/*" -and $_.type -eq "blob" })

if ($ImportPathsOnly) {
  $prefixes = @(
    "web/components/home/", "web/components/pdp/", "web/components/category/", "web/components/marketing/",
    "web/components/motion/", "web/components/brand/", "web/components/legal/", "web/components/ai/",
    "web/components/chrome/", "web/public/",
    "web/app/treatments/", "web/app/programs/", "web/app/stacks/", "web/app/categories/",
    "web/app/pain-relief/", "web/app/faqs/", "web/app/careers/", "web/app/guide/"
  )
  $exact = @(
    "web/app/page.tsx", "web/app/page.module.css", "web/app/layout.tsx", "web/app/globals.css"
  )
  $blobs = @($blobs | Where-Object {
    $p = $_.path
    ($exact -contains $p) -or ($prefixes | Where-Object { $p -like "$_*" })
  })
}

function Get-RawUrl([string]$path) {
  $parts = $path -split "/"
  $encoded = ($parts | ForEach-Object { [Uri]::EscapeDataString($_) }) -join "/"
  return "https://raw.githubusercontent.com/TIDL-Health/website/$Commit/$encoded"
}

Write-Host "Downloading $($blobs.Count) files to $OutRoot ..."
$ok = 0
$fail = 0
$i = 0
foreach ($batch in ($blobs | Group-Object { [math]::Floor($i++ / $BatchSize) })) {
  $jobs = @()
  foreach ($item in $batch.Group) {
    $rel = $item.path -replace "/", [IO.Path]::DirectorySeparatorChar
    $dest = Join-Path $OutRoot $rel
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $url = Get-RawUrl $item.path
    $jobs += Start-Job -ScriptBlock {
      param($Url, $Dest)
      try {
        Invoke-WebRequest -Uri $Url -OutFile $Dest -UseBasicParsing -TimeoutSec 180 | Out-Null
        return 1
      } catch { return 0 }
    } -ArgumentList $url, $dest
  }
  $results = $jobs | Wait-Job | Receive-Job
  $jobs | Remove-Job -Force
  $ok += ($results | Measure-Object -Sum).Sum
  $fail += $batch.Group.Count - ($results | Measure-Object -Sum).Sum
  if (($ok + $fail) % 400 -lt $BatchSize) {
    Write-Host "  ... $($ok + $fail) / $($blobs.Count)"
  }
}

Write-Host "Done: $ok OK, $fail failed"
if ($fail -gt ($blobs.Count * 0.05)) { exit 2 }
