# Start ncSender for testing on this PC, with a stand-in controller so it connects
# (Ethernet / Telnet, 127.0.0.1:8000) and plugins and settings open. Both stand-ins live
# at https://github.com/stmoha/fake-grblhal; this fetches the latest next to itself each
# run (and uses the copy already here if GitHub can't be reached).
#
# The controller (-Controller):
#   sim  (default)  the real grblHAL firmware built as a copy of the Altfinity
#                   (grblhal-sim): its settings, planner, rotary A, homing and probe.
#                   Keeps its settings in .\grblhal-sim\EEPROM.DAT.
#   fake            the quick Python stand-in (acts like Grbl)
#
#   .\start-ncsender-test.ps1             controller + the patched ncSender
#                                         (source build: server + 3D view) + browser
#   .\start-ncsender-test.ps1 -FakeOnly   just the controller, for your installed
#                                         ncSender: start that yourself
#   .\start-ncsender-test.ps1 -Speed 10   jobs run 10x faster than real time
#   .\start-ncsender-test.ps1 -Controller fake -Axes 3   Python stand-in, plain XYZ
#
# Each part runs in its own window: close the windows to stop.
param(
  [switch]$FakeOnly,
  [ValidateSet('sim', 'fake')][string]$Controller = 'sim',
  [string]$Machine = 'stefan-altfinity',
  [string]$FakeRef = 'main',
  [ValidateSet(3, 4)][int]$Axes = 4,
  [double]$Speed = 1,
  [int]$FakePort = 8000,
  [string]$SourceDir = "$env:USERPROFILE\ncsender-a-preview\ncSender-claude-lucid-cray-296q4g\src",
  [string]$DotnetDir = "$env:LOCALAPPDATA\Microsoft\dotnet10"
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$fake = Join-Path $here 'fake_grblhal_server.py'
$simDir = Join-Path $here 'grblhal-sim'
$simExe = Join-Path $simDir "grblHAL_sim-$Machine.exe"
$base = "https://raw.githubusercontent.com/stmoha/fake-grblhal/$FakeRef"

function Get-Latest([string]$url, [string]$file) {
  try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest $url -OutFile "$file.new" -TimeoutSec 30
    Move-Item -Force "$file.new" $file
    Unblock-File $file -ErrorAction SilentlyContinue
  } catch {
    Remove-Item "$file.new" -ErrorAction SilentlyContinue
    if (-not (Test-Path $file)) { throw "Couldn't download $url and there's no copy at $file" }
    Write-Host "Couldn't check GitHub for a newer $(Split-Path -Leaf $file), using the one here."
  }
}

function Test-Port([int]$port) {
  [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}
function Start-Window([string]$title, [string]$command) {
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "`$host.UI.RawUI.WindowTitle='$title'; $command"
}

# 1. The controller
if (Test-Port $FakePort) {
  Write-Host "Controller: something is already listening on port $FakePort, using that."
} elseif ($Controller -eq 'sim') {
  New-Item -ItemType Directory -Force $simDir | Out-Null
  $running = Get-Process -Name ([IO.Path]::GetFileNameWithoutExtension($simExe)) -ErrorAction SilentlyContinue
  if (-not $running) { Get-Latest "$base/grblhal-sim/bin/grblHAL_sim-$Machine.exe" $simExe }
  Start-Process powershell -WorkingDirectory $simDir -ArgumentList '-NoExit', '-Command', "`$host.UI.RawUI.WindowTitle='grblHAL simulator - $Machine :$FakePort (close to stop)'; & '$simExe' -n -p $FakePort -t $Speed -b NUL -s NUL"
  Write-Host "Controller: grblHAL simulator ($Machine) on port $FakePort, speed x$Speed. It starts in Alarm until homed, like the machine."
} else {
  Get-Latest "$base/fake_grblhal_server.py" $fake
  Start-Window "Fake grblHAL :$FakePort (close to stop)" "python '$fake' --port $FakePort --axes $Axes --speed $Speed"
  Write-Host "Controller: Python fake on port $FakePort ($(if ($Axes -eq 4) {'XYZA'} else {'XYZ'}), speed x$Speed)."
}
if ($FakeOnly) {
  Write-Host "Now start your installed ncSender. Its connection must be Ethernet / Telnet, 127.0.0.1:$FakePort."
  return
}

# 2. The patched ncSender (source build)
if (Test-Port 8090) {
  Write-Warning "Port 8090 is in use: another ncSender is running. Close it and run this again."
  return
}
if (-not (Test-Path "$DotnetDir\dotnet.exe")) { throw ".NET 10 not found in $DotnetDir" }
if (-not (Test-Path "$SourceDir\NcSender.Server")) { throw "ncSender source not found in $SourceDir" }

$dotnetEnv = "`$env:DOTNET_ROOT='$DotnetDir'; `$env:PATH='$DotnetDir;'+`$env:PATH; `$env:DOTNET_CLI_TELEMETRY_OPTOUT='1'"
Start-Window 'ncSender test SERVER (close to stop)' "$dotnetEnv; Set-Location '$SourceDir\NcSender.Server'; dotnet run"
Start-Window 'ncSender test CLIENT (close to stop)' "Set-Location '$SourceDir\NcSender.Client'; npm run dev"

# 3. Open the browser once both answer
Write-Host 'Waiting for ncSender...'
$deadline = (Get-Date).AddMinutes(3)
while ((Get-Date) -lt $deadline) {
  if ((Test-Port 8090) -and (Test-Port 5174)) {
    Start-Process 'http://localhost:5174/'
    Write-Host 'ncSender is up: http://localhost:5174/'
    return
  }
  Start-Sleep -Seconds 2
}
Write-Warning 'ncSender did not come up within 3 minutes: check the SERVER and CLIENT windows.'
