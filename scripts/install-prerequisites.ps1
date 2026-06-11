[CmdletBinding()]
param(
  [switch]$SkipFirewall,
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$requiredNodeMajor = 20
$applicationPort = 3000
$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ".."))
$logDirectory = Join-Path $repoRoot ".local-dev"
$logPath = Join-Path $logDirectory "install-prerequisites.log"
$transcriptStarted = $false
$installationFailed = $false

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Request-Administrator {
  if (Test-Administrator) {
    return
  }

  Write-Host "Administrator access is required to install Node.js and configure the firewall."
  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$PSCommandPath`""
  )

  if ($SkipFirewall) {
    $arguments += "-SkipFirewall"
  }
  $arguments += "-NoPause"

  try {
    $process = Start-Process powershell.exe `
      -Verb RunAs `
      -ArgumentList $arguments `
      -WorkingDirectory (Get-Location) `
      -Wait `
      -PassThru
  } catch {
    throw "Administrator access was declined. Installation cannot continue."
  }

  exit $process.ExitCode
}

function Refresh-Path {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"
}

function Publish-EnvironmentChange {
  if (-not ("EnvironmentChange.NativeMethods" -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;

namespace EnvironmentChange {
  public static class NativeMethods {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
      IntPtr hWnd,
      uint Msg,
      UIntPtr wParam,
      string lParam,
      uint fuFlags,
      uint uTimeout,
      out UIntPtr lpdwResult
    );
  }
}
"@
  }

  $result = [UIntPtr]::Zero
  [void][EnvironmentChange.NativeMethods]::SendMessageTimeout(
    [IntPtr]0xffff,
    0x001A,
    [UIntPtr]::Zero,
    "Environment",
    0x0002,
    5000,
    [ref]$result
  )
}

function Get-NodeCommand {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($nodeCommand) {
    return $nodeCommand.Source
  }

  $candidates = @()
  if ($env:ProgramFiles) {
    $candidates += Join-Path $env:ProgramFiles "nodejs\node.exe"
  }
  if (${env:ProgramFiles(x86)}) {
    $candidates += Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe"
  }

  return $candidates |
    Where-Object { Test-Path $_ } |
    Select-Object -First 1
}

function Get-NodeMajorVersion {
  $nodeCommand = Get-NodeCommand
  if (-not $nodeCommand) {
    return $null
  }

  $nodeVersion = (& $nodeCommand -v).Trim()
  if ($LASTEXITCODE -ne 0) {
    return $null
  }

  if ($nodeVersion -match "^v(?<major>\d+)") {
    return [int]$Matches.major
  }

  return $null
}

function Ensure-NodePath {
  $nodeCommand = Get-NodeCommand
  if (-not $nodeCommand) {
    throw "The Node.js installation directory could not be located."
  }

  $nodeDirectory = Split-Path -Parent $nodeCommand
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $machineEntries = @($machinePath -split ";" | Where-Object { $_ })
  $alreadyConfigured = $machineEntries |
    Where-Object { $_.TrimEnd("\") -ieq $nodeDirectory.TrimEnd("\") }

  if (-not $alreadyConfigured) {
    Write-Step "Adding Node.js and npm to the system PATH"
    $nextMachinePath = if ([string]::IsNullOrWhiteSpace($machinePath)) {
      $nodeDirectory
    } else {
      "$machinePath;$nodeDirectory"
    }
    [Environment]::SetEnvironmentVariable("Path", $nextMachinePath, "Machine")
    Publish-EnvironmentChange
  }

  Refresh-Path

  $npmPath = Join-Path $nodeDirectory "npm.cmd"
  if (-not (Test-Path $npmPath)) {
    throw "npm.cmd was not found in the Node.js installation directory '$nodeDirectory'."
  }

  return $npmPath
}

function Invoke-StepCommand {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FailureMessage Exit code: $LASTEXITCODE"
  }
}

function Install-NodeWithWinget {
  $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
  if (-not $winget) {
    return $false
  }

  Write-Step "Installing Node.js LTS with winget"
  try {
    & $winget.Source install `
      --id OpenJS.NodeJS.LTS `
      --exact `
      --accept-package-agreements `
      --accept-source-agreements `
      --silent `
      --disable-interactivity

    return $LASTEXITCODE -eq 0
  } catch {
    Write-Warning "winget could not install Node.js. Trying the official MSI instead."
    return $false
  }
}

function Get-NodeWindowsArchitecture {
  $architecture = if ($env:PROCESSOR_ARCHITEW6432) {
    $env:PROCESSOR_ARCHITEW6432
  } else {
    $env:PROCESSOR_ARCHITECTURE
  }

  switch ($architecture.ToUpperInvariant()) {
    "AMD64" { return "x64" }
    "ARM64" { return "arm64" }
    default {
      throw "Unsupported Windows architecture: $architecture. This installer supports x64 and ARM64."
    }
  }
}

function Install-NodeWithMsi {
  Write-Step "Downloading the current Node.js LTS installer"

  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $architecture = Get-NodeWindowsArchitecture
  $fileName = "win-$architecture-msi"

  try {
    $releases = Invoke-RestMethod `
      -Uri "https://nodejs.org/dist/index.json" `
      -UseBasicParsing `
      -TimeoutSec 60
  } catch {
    throw "Unable to contact nodejs.org. Check the internet connection, proxy, or firewall and rerun the installer. $($_.Exception.Message)"
  }

  $release = $releases |
    Where-Object { $_.lts -and $_.files -contains $fileName } |
    Select-Object -First 1

  if (-not $release) {
    throw "Unable to locate a Windows $architecture Node.js LTS installer."
  }

  $version = $release.version
  $installerPath = Join-Path $env:TEMP "node-$version-$architecture.msi"
  $installerUrl = "https://nodejs.org/dist/$version/node-$version-$architecture.msi"

  try {
    try {
      Invoke-WebRequest `
        -Uri $installerUrl `
        -OutFile $installerPath `
        -UseBasicParsing `
        -TimeoutSec 300
    } catch {
      throw "Node.js download failed. Check the internet connection, proxy, or antivirus software. $($_.Exception.Message)"
    }

    if (-not (Test-Path $installerPath) -or (Get-Item $installerPath).Length -lt 1MB) {
      throw "The downloaded Node.js installer is missing or incomplete."
    }

    Write-Step "Installing Node.js $version"
    $installer = Start-Process msiexec.exe `
      -ArgumentList @("/i", "`"$installerPath`"", "/qn", "/norestart") `
      -Wait `
      -PassThru

    if ($installer.ExitCode -notin @(0, 3010)) {
      throw "Node.js MSI installation failed with exit code $($installer.ExitCode)."
    }
  } finally {
    Remove-Item -LiteralPath $installerPath -Force -ErrorAction SilentlyContinue
  }
}

function Install-Node {
  if (-not (Install-NodeWithWinget)) {
    Install-NodeWithMsi
  }

  Refresh-Path
}

function Configure-Firewall {
  if ($SkipFirewall) {
    Write-Step "Skipping Windows Firewall configuration"
    return
  }

  $ruleName = "Election Online - TCP 3000"
  if (
    -not (Get-Command Get-NetFirewallRule -ErrorAction SilentlyContinue) -or
    -not (Get-Command New-NetFirewallRule -ErrorAction SilentlyContinue)
  ) {
    Write-Warning "Windows Firewall cmdlets are unavailable. Add an inbound Private-network TCP rule for port $applicationPort manually."
    return
  }

  $existingRule = Get-NetFirewallRule `
    -DisplayName $ruleName `
    -ErrorAction SilentlyContinue

  if ($existingRule) {
    Write-Step "Windows Firewall rule already exists"
    Set-NetFirewallRule `
      -DisplayName $ruleName `
      -Enabled True `
      -Profile Private `
      -Action Allow | Out-Null
    return
  }

  Write-Step "Allowing voter machines to connect on TCP port 3000"
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $applicationPort `
    -Profile Private | Out-Null
}

function Test-NetworkProfile {
  if (-not (Get-Command Get-NetConnectionProfile -ErrorAction SilentlyContinue)) {
    return
  }

  $connectedProfiles = @(
    Get-NetConnectionProfile -ErrorAction SilentlyContinue |
      Where-Object { $_.IPv4Connectivity -ne "Disconnected" }
  )
  $publicProfiles = @($connectedProfiles | Where-Object { $_.NetworkCategory -eq "Public" })

  if ($publicProfiles.Count -gt 0) {
    Write-Warning "The connected network is marked Public. The firewall rule only permits Private networks, so voter machines may not connect."
    Write-Host "Review Windows Settings > Network & internet > Properties and set the trusted local network to Private."
  }
}

function Get-LocalNetworkAddresses {
  if (-not (Get-Command Get-NetIPAddress -ErrorAction SilentlyContinue)) {
    return @()
  }

  return Get-NetIPAddress `
    -AddressFamily IPv4 `
    -AddressState Preferred `
    -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*"
    } |
    Select-Object -ExpandProperty IPAddress -Unique
}

function Start-ElectionApplication {
  $launcherPath = Join-Path $scriptDir "start-election.cmd"
  if (-not (Test-Path $launcherPath)) {
    throw "Application launcher not found: $launcherPath"
  }

  Write-Step "Starting Election Online"
  Start-Process `
    -FilePath $launcherPath `
    -WorkingDirectory $repoRoot | Out-Null

  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
    Start-Sleep -Seconds 1
    try {
      $response = Invoke-WebRequest `
        -Uri "http://localhost:$applicationPort/api/election/status" `
        -UseBasicParsing `
        -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
    }
  }

  if (-not $ready) {
    throw "The application did not become ready on port $applicationPort. Review the server window and '$logPath'."
  }
}

try {
  Request-Administrator

  if ($env:OS -ne "Windows_NT") {
    throw "This installer supports Windows only."
  }
  if ($PSVersionTable.PSVersion.Major -lt 5) {
    throw "Windows PowerShell 5.1 or newer is required."
  }

  if (-not (Test-Path (Join-Path $repoRoot "package.json"))) {
    throw "package.json was not found at '$repoRoot'. Keep the complete project folder together."
  }
  if (-not (Test-Path (Join-Path $repoRoot "package-lock.json"))) {
    throw "package-lock.json is required for a repeatable installation."
  }
  if ($repoRoot.StartsWith("\\")) {
    throw "The project is on a network path. Copy the complete project folder to a local drive before installing."
  }

  Set-Location $repoRoot
  Refresh-Path

  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  Start-Transcript -Path $logPath -Force | Out-Null
  $transcriptStarted = $true

  $testFile = Join-Path $repoRoot ".install-write-test"
  try {
    Set-Content -LiteralPath $testFile -Value "ok" -Encoding ASCII
  } finally {
    Remove-Item -LiteralPath $testFile -Force -ErrorAction SilentlyContinue
  }

  $drive = Get-PSDrive -Name ([System.IO.Path]::GetPathRoot($repoRoot).TrimEnd(":\\")) `
    -ErrorAction SilentlyContinue
  if ($drive -and $drive.Free -lt 1GB) {
    throw "At least 1 GB of free disk space is required on $($drive.Root)."
  }

  $nodeMajor = Get-NodeMajorVersion
  if (-not $nodeMajor -or $nodeMajor -lt $requiredNodeMajor) {
    Install-Node
    $nodeMajor = Get-NodeMajorVersion
  }

  if (-not $nodeMajor -or $nodeMajor -lt $requiredNodeMajor) {
    throw "Node.js $requiredNodeMajor or newer is required, but installation could not be verified. Restart Windows if the installer requested a reboot, then run this installer again."
  }

  $npmCommand = Ensure-NodePath

  Write-Step "Using Node.js $(& (Get-NodeCommand) -v) and npm $(& $npmCommand -v)"

  Write-Step "Installing exact npm dependencies from package-lock.json"
  Invoke-StepCommand `
    -Command $npmCommand `
    -Arguments @("ci", "--no-audit", "--no-fund") `
    -FailureMessage "npm dependency installation failed. Check internet access, proxy settings, free disk space, and antivirus restrictions."

  Write-Step "Checking TypeScript"
  Invoke-StepCommand `
    -Command $npmCommand `
    -Arguments @("run", "typecheck") `
    -FailureMessage "TypeScript verification failed."

  Write-Step "Creating the production build"
  Invoke-StepCommand `
    -Command $npmCommand `
    -Arguments @("run", "build") `
    -FailureMessage "Production build failed."

  Configure-Firewall
  Test-NetworkProfile

  $portOwner = $null
  if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    $portOwner = Get-NetTCPConnection `
      -LocalPort $applicationPort `
      -State Listen `
      -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  if ($portOwner) {
    throw "TCP port $applicationPort is already used by process ID $($portOwner.OwningProcess). Stop that process and rerun the installer."
  }

  Start-ElectionApplication

  Write-Step "Installation completed and Election Online is running"
  Write-Host ""
  Write-Host "Admin URL:"
  Write-Host "  http://localhost:$applicationPort/admin"

  $addresses = @(Get-LocalNetworkAddresses)
  if ($addresses.Count -gt 0) {
    Write-Host ""
    Write-Host "Voter URL(s):"
    foreach ($address in $addresses) {
      Write-Host "  http://$address`:$applicationPort/vote"
    }
  } else {
    Write-Host ""
    Write-Host "Connect the host to the local network, then run 'ipconfig' to find its IPv4 address."
  }
} catch {
  $installationFailed = $true
  Write-Host ""
  Write-Host "INSTALLATION FAILED" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($transcriptStarted) {
    Write-Host ""
    Write-Host "Detailed log:"
    Write-Host "  $logPath"
  }
} finally {
  if ($transcriptStarted) {
    try {
      Stop-Transcript | Out-Null
    } catch {
    }
  }
}

if ($installationFailed) {
  exit 1
}
