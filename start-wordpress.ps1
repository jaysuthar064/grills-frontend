<#
.SYNOPSIS
    Starts or stops the local Grill On the Green WordPress backend.

.DESCRIPTION
    Uses Laragon's Apache/MySQL/PHP binaries and serves this project from cms/
    on http://localhost:8885. Apache and MySQL are shared with other Laragon
    projects; -Stop shuts those shared services down.

.PARAMETER Stop
    Stop Apache and MySQL.

.PARAMETER Fix
    Recreate the C:\laragon\www\grill-on-the-green junction.

.PARAMETER NoBrowser
    Do not open a browser window.

.PARAMETER Admin
    Open the one-click admin login URL.
#>

[CmdletBinding()]
param(
    [switch] $Stop,
    [switch] $Fix,
    [switch] $NoBrowser,
    [switch] $Admin
)

$ErrorActionPreference = 'Stop'

$Root       = $PSScriptRoot
$CmsDir     = Join-Path $Root 'cms'
$WpCli      = Join-Path $Root 'tools\wp-cli.phar'
$LaragonBin = 'C:\laragon\bin'
$Junction   = 'C:\laragon\www\grill-on-the-green'
$SiteUrl    = 'http://localhost:8885'
$WebPort    = 8885
$DbPort     = 3306
$DbName     = 'grill_on_the_green'
$DbUser     = 'root'
$LoginToken = '85db595dc94d97306fecd6924fadc27c2115079c117afd2f21bc3299e1b16c7d'
$AutoLogin  = "$SiteUrl/?gotg_login=1&token=$LoginToken"

function Write-Step { param($m) Write-Host "  ->  $m" -ForegroundColor Cyan }
function Write-Ok   { param($m) Write-Host "  OK  $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "  !   $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "  X   $m" -ForegroundColor Red }

function Test-PortListening {
    param([int] $P)
    $null -ne (Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction SilentlyContinue)
}

function Find-Newest {
    param([string] $Dir, [string] $Exe)
    if (-not (Test-Path $Dir)) { return $null }
    Get-ChildItem $Dir -Directory |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName $Exe } |
        Where-Object { Test-Path $_ } |
        Select-Object -First 1
}

function Wait-ForPort {
    param([int] $P, [int] $TimeoutSec = 30)
    $elapsed = 0
    while (-not (Test-PortListening -P $P) -and $elapsed -lt $TimeoutSec) {
        Start-Sleep -Milliseconds 500
        $elapsed += 0.5
    }
    return (Test-PortListening -P $P)
}

Write-Host ''
Write-Host '  Grill On the Green - local WordPress' -ForegroundColor White
Write-Host '  -----------------------------------' -ForegroundColor DarkGray

$Php    = (Get-Command php -ErrorAction SilentlyContinue).Source
if (-not $Php) { $Php = Find-Newest -Dir "$LaragonBin\php" -Exe 'php.exe' }
$Mysql  = Find-Newest -Dir "$LaragonBin\mysql"  -Exe 'bin\mysql.exe'
$Mysqld = Find-Newest -Dir "$LaragonBin\mysql"  -Exe 'bin\mysqld.exe'
$Httpd  = Find-Newest -Dir "$LaragonBin\apache" -Exe 'bin\httpd.exe'

if (-not $Php)   { Write-Err 'PHP not found. Install Laragon or put php.exe on PATH.'; exit 1 }
if (-not $Mysql) { Write-Err "MySQL not found under $LaragonBin\mysql."; exit 1 }

if ($Stop) {
    Write-Step 'Stopping Apache ...'
    Get-Process httpd -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Ok 'Apache stopped'

    Write-Step 'Stopping MySQL ...'
    Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Ok 'MySQL stopped'

    Write-Host ''
    Write-Warn 'Apache and MySQL are shared with your other Laragon sites.'
    Write-Host ''
    exit 0
}

Write-Ok "PHP  $((& $Php -r 'echo PHP_VERSION;'))"

$junctionOk = $false
if (Test-Path $Junction) {
    $item = Get-Item $Junction -Force
    $junctionOk = ($item.LinkType -eq 'Junction') -and
                  ($item.Target -and ((Resolve-Path $item.Target[0]).Path.TrimEnd('\') -ieq $CmsDir.TrimEnd('\')))
}

if ($Fix -or -not $junctionOk) {
    if (-not $junctionOk) { Write-Warn 'Laragon junction is not pointing at cms/ - repairing.' }
    Write-Step "Linking $Junction -> $CmsDir"
    if (Test-Path $Junction) {
        cmd /c rmdir "$Junction" | Out-Null
    }
    cmd /c mklink /J "$Junction" "$CmsDir" | Out-Null
    Write-Ok 'Junction repaired'
} else {
    Write-Ok 'Laragon junction -> cms/'
}

if (Test-PortListening -P $DbPort) {
    Write-Ok "MySQL running on $DbPort"
} else {
    if (-not $Mysqld) { Write-Err 'mysqld.exe not found.'; exit 1 }
    Write-Step 'Starting MySQL ...'
    Start-Process -FilePath $Mysqld -ArgumentList '--console' -WindowStyle Hidden
    if (Wait-ForPort -P $DbPort) { Write-Ok 'MySQL started' }
    else { Write-Err 'MySQL did not start within 30s.'; exit 1 }
}

$exists = & $Mysql -u $DbUser -h 127.0.0.1 -P $DbPort -N -B -e "SHOW DATABASES LIKE '$DbName';" 2>$null
if ([string]::IsNullOrWhiteSpace($exists)) {
    Write-Step "Creating database '$DbName' ..."
    & $Mysql -u $DbUser -h 127.0.0.1 -P $DbPort -e "CREATE DATABASE ``$DbName`` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    Write-Ok "Database '$DbName' created"
} else {
    Write-Ok "Database '$DbName' present"
}

if (-not (Test-Path (Join-Path $CmsDir 'wp-load.php')))   { Write-Err "WordPress core missing from $CmsDir."; exit 1 }
if (-not (Test-Path (Join-Path $CmsDir 'wp-config.php'))) { Write-Err "wp-config.php missing from $CmsDir."; exit 1 }

if (Test-PortListening -P $WebPort) {
    Write-Ok "Web server already running on $WebPort"
} else {
    if (-not $Httpd) { Write-Err "Apache not found under $LaragonBin\apache."; exit 1 }
    Write-Step 'Starting Apache ...'
    Start-Process -FilePath $Httpd -WindowStyle Hidden
    if (Wait-ForPort -P $WebPort) { Write-Ok 'Apache started' }
    else { Write-Err 'Apache did not start within 30s. Check Laragon Apache config and logs.'; exit 1 }
}

if (Test-Path $WpCli) {
    Push-Location $CmsDir
    try { & $Php $WpCli cron event run --due-now --quiet 2>$null | Out-Null } catch { }
    Pop-Location
}

$url = if ($Admin) { $AutoLogin } else { $SiteUrl + '/' }

Write-Host ''
Write-Host "  Site       $SiteUrl"                -ForegroundColor White
Write-Host "  Admin      $SiteUrl/wp-admin/"      -ForegroundColor White
Write-Host "  Auto login $AutoLogin"              -ForegroundColor White
Write-Host "  REST       $SiteUrl/wp-json/gotg/v1/home" -ForegroundColor White
Write-Host "  Login      admin / admin"           -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Services stay up after this window closes.' -ForegroundColor DarkGray
Write-Host '  Run  .\start-wordpress.ps1 -Stop  to shut them down.' -ForegroundColor DarkGray
Write-Host ''

if (-not $NoBrowser) { Start-Process $url }
