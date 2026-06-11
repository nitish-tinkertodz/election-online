$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Get-NodeMajorVersion {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    return $null
  }

  $nodeVersion = (& node -v).Trim()
  if ($LASTEXITCODE -ne 0) {
    return $null
  }

  if ($nodeVersion -match "^v(?<major>\d+)") {
    return [int]$Matches.major
  }

  return $null
}

function Invoke-StepCommand {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw $FailureMessage
  }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

$requiredNodeMajor = 20
$nodeMajor = Get-NodeMajorVersion

if (-not $nodeMajor -or $nodeMajor -lt $requiredNodeMajor) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "Node.js $requiredNodeMajor+ is required. Install winget or install Node.js manually from https://nodejs.org and rerun this script."
  }

  Write-Step "Installing Node.js LTS with winget"
  Invoke-StepCommand -Command "winget" -Arguments @(
    "install",
    "--id",
    "OpenJS.NodeJS.LTS",
    "--accept-package-agreements",
    "--accept-source-agreements",
    "--silent"
  ) -FailureMessage "Node.js installation failed via winget."

  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"

  $nodeMajor = Get-NodeMajorVersion
  if (-not $nodeMajor -or $nodeMajor -lt $requiredNodeMajor) {
    throw "Node.js installation completed, but node is still unavailable in this shell. Open a new terminal and rerun the script."
  }
}

Write-Step "Using Node.js major version $nodeMajor"

Write-Step "Installing npm dependencies"
Invoke-StepCommand -Command "npm" -Arguments @("install") -FailureMessage "npm install failed."

Write-Step "Prerequisites installed successfully"
Write-Host "Run 'npm run dev -- --hostname 0.0.0.0' to start the app for other devices on the network."
