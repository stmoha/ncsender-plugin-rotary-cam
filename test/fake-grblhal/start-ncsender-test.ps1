# Start ncSender for testing on this PC, with the fake grblHAL controller so it
# connects (Ethernet / Telnet, 127.0.0.1:8000) and plugins and settings open.
# The fake controller lives at https://github.com/stmoha/fake-grblhal: this
# fetches its latest fake_grblhal_server.py next to itself each run (and uses the
# copy already there if GitHub can't be reached).
#
#   .\start-ncsender-test.ps1             fake controller + the patched ncSender
#                                         (source build: server + 3D view) + browser
#   .\start-ncsender-test.ps1 -FakeOnly   just the fake controller, for your
#                                         installed ncSender: start that yourself
#   .\start-ncsender-test.ps1 -Axes 3     plain XYZ machine (no rotary A)
#   .\start-ncsender-test.ps1 -Speed 10   jobs run 10x faster than real time
#
# Each part runs in its own window: close the windows to stop.
param(
  [switch]$FakeOnly,
  [ValidateSet(3, 4)][int]$Axes = 4,
  [double]$Speed = 1,
  [int]$FakePort = 8000,
  [string]$SourceDir = "$env:USERPROFILE\ncsender-a-preview\ncSender-claude-lucid-cray-296q4g\src",
  [string]$DotnetDir = "$env:LOCALAPPDATA\Microsoft\dotnet10"
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$fake = Join-Path $here 'fake_grblhal_server.py'

try {
  $ProgressPreference = 'SilentlyContinue'
  Invoke-WebRequest 'https://raw.githubusercontent.com/stmoha/fake-grblhal/main/fake_grblhal_server.py' -OutFile "$fake.new" -TimeoutSec 15
  Move-Item -Force "$fake.new" $fake
} catch {
  Remove-Item "$fake.new" -ErrorAction SilentlyContinue
  if (-not (Test-Path $fake)) { throw "Couldn't download the fake controller and there's no copy in $here" }
  Write-Host "Fake controller: couldn't check GitHub for a newer copy, using the one here."
}

function Test-Port([int]$port) {
  [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}
function Start-Window([string]$title, [string]$command) {
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "`$host.UI.RawUI.WindowTitle='$title'; $command"
}

# 1. The fake controller
if (Test-Port $FakePort) {
  Write-Host "Fake controller: something is already listening on port $FakePort, using that."
} else {
  Start-Window "Fake grblHAL :$FakePort (close to stop)" "python '$fake' --port $FakePort --axes $Axes --speed $Speed"
  Write-Host "Fake controller: started on port $FakePort ($(if ($Axes -eq 4) {'XYZA'} else {'XYZ'}), speed x$Speed)."
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
