import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export interface ZipEntryInput {
  name: string;
  data: Buffer;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = ((hours & 0x1f) << 11) | ((minutes & 0x3f) << 5) | (seconds & 0x1f);
  const dosDate = (((year - 1980) & 0x7f) << 9) | ((month & 0x0f) << 5) | (day & 0x1f);
  return { dosTime, dosDate };
}

export function buildZipArchive(entries: ZipEntryInput[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const { dosTime, dosDate } = getDosDateTime();

  for (const entry of entries) {
    const fileNameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const uncompressed = entry.data;
    const checksum = crc32(uncompressed);

    const deflated = zlib.deflateRawSync(uncompressed);
    const useDeflate = deflated.length < uncompressed.length;
    const payload = useDeflate ? deflated : uncompressed;
    const method = useDeflate ? 8 : 0;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed: 2.0
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(uncompressed.length, 22);
    localHeader.writeUInt16LE(fileNameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra length

    localParts.push(localHeader, fileNameBuf, payload);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0x0800, 8); // UTF-8 filename flag
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(uncompressed.length, 24);
    centralHeader.writeUInt16LE(fileNameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, fileNameBuf);
    offset += localHeader.length + fileNameBuf.length + payload.length;
  }

  const centralDirBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

export function buildPngIco(pngBuffer: Buffer, width: number, height: number): Buffer {
  const header = Buffer.alloc(22);
  // ICONDIR (6 bytes)
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(1, 4); // Image count: 1

  // ICONDIRENTRY (16 bytes)
  header.writeUInt8(width >= 256 ? 0 : width, 6);
  header.writeUInt8(height >= 256 ? 0 : height, 7);
  header.writeUInt8(0, 8); // Color count
  header.writeUInt8(0, 9); // Reserved
  header.writeUInt16LE(1, 10); // Color planes
  header.writeUInt16LE(32, 12); // Bits per pixel
  header.writeUInt32LE(pngBuffer.length, 14);
  header.writeUInt32LE(22, 18); // Offset to image data

  return Buffer.concat([header, pngBuffer]);
}

export function resolveSafeAppOrigin(
  requestedOrigin?: string,
  fallbackOrigin?: string
): string {
  const candidates = [requestedOrigin, fallbackOrigin].filter(
    (c): c is string => typeof c === 'string' && c.trim().length > 0
  );

  for (const raw of candidates) {
    try {
      const parsed = new URL(raw.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        continue;
      }
      const origin = parsed.origin;
      if (/^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin)) {
        return origin;
      }
    } catch {
      // Try next candidate
    }
  }

  return 'http://localhost:3000';
}

function toCRLF(text: string): Buffer {
  return Buffer.from(text.replace(/\r?\n/g, '\r\n'), 'utf8');
}

export function createWindowsInstallerZip(
  appOrigin: string,
  publicDir: string,
  autoStartOnLogin = false
): Buffer {
  const safeOrigin = resolveSafeAppOrigin(appOrigin);
  const pngPath = path.join(publicDir, 'pwa-192x192.png');
  const fallbackPngPath = path.join(publicDir, 'apple-touch-icon.png');

  let icoBuffer: Buffer | null = null;
  if (fs.existsSync(pngPath)) {
    const png = fs.readFileSync(pngPath);
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    icoBuffer = buildPngIco(png, w, h);
  } else if (fs.existsSync(fallbackPngPath)) {
    const png = fs.readFileSync(fallbackPngPath);
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    icoBuffer = buildPngIco(png, w, h);
  }

  const installCmd = `@echo off
setlocal
title Executive Term - Windows 11 Installer
echo.
echo  ============================================================
echo   Executive Term - Windows 11 Desktop Installer
echo  ============================================================
echo.
if not exist "%~dp0app\\install.ps1" (
  echo  ERROR: Setup files not found next to this script.
  echo  Please right-click the .zip file, choose "Extract All...",
  echo  and run "Install Executive Term.cmd" from the extracted folder.
  echo.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\\install.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
if %EXITCODE% NEQ 0 (
  echo  Installation failed with exit code %EXITCODE%.
  pause
  exit /b %EXITCODE%
)
echo  Executive Term installed and starting automatically...
timeout /t 2 /nobreak >nul
`;

  const uninstallCmd = `@echo off
setlocal
title Executive Term - Uninstaller
echo.
if not exist "%~dp0app\\uninstall.ps1" (
  echo  Please extract the .zip folder first before running the uninstaller.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\\uninstall.ps1"
pause
`;

  const installedUninstallCmd = `@echo off
setlocal
title Executive Term - Uninstaller
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
pause
`;

  const installPs1 = `$ErrorActionPreference = "Stop"

$AppName = "Executive Term"
$AppUrl = "${safeOrigin}"
$AutoStartOnLogin = ${autoStartOnLogin ? '$true' : '$false'}
$InstallDir = Join-Path $env:LOCALAPPDATA "ExecutiveTerm"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$IconSource = Join-Path $ScriptDir "ExecutiveTerm.ico"
$IconDest = Join-Path $InstallDir "ExecutiveTerm.ico"
$UninstallPs1Source = Join-Path $ScriptDir "uninstall.ps1"
$UninstallPs1Dest = Join-Path $InstallDir "uninstall.ps1"
$UninstallCmdDest = Join-Path $InstallDir "Uninstall Executive Term.cmd"
$LaunchCmdDest = Join-Path $InstallDir "Launch Executive Term.cmd"

# Remove Windows Mark-of-the-Web so extracted files run cleanly without extra prompts
Get-ChildItem -Path $RootDir -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

Write-Host "Installing $AppName to $InstallDir..." -ForegroundColor Cyan

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

if (Test-Path $IconSource) {
  Copy-Item -Path $IconSource -Destination $IconDest -Force
}
Copy-Item -Path $UninstallPs1Source -Destination $UninstallPs1Dest -Force

$LocalUninstallBatch = @"
@echo off
setlocal
title Executive Term - Uninstaller
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
pause
"@
Set-Content -Path $UninstallCmdDest -Value $LocalUninstallBatch -Encoding ASCII

$BrowserCandidates = @(
  "\${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\msedge.exe",
  "$env:ProgramFiles\\Microsoft\\Edge\\Application\\msedge.exe",
  "$env:LOCALAPPDATA\\Microsoft\\Edge\\Application\\msedge.exe",
  "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe",
  "\${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe",
  "$env:LOCALAPPDATA\\Google\\Chrome\\Application\\chrome.exe",
  "$env:ProgramFiles\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "\${env:ProgramFiles(x86)}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
)

$BrowserPath = $null
foreach ($Candidate in $BrowserCandidates) {
  if ($Candidate -and (Test-Path $Candidate)) {
    $BrowserPath = $Candidate
    break
  }
}

# Fallback: inspect Windows App Paths registry and PATH
if (-not $BrowserPath) {
  foreach ($ExeName in @("msedge.exe", "chrome.exe", "brave.exe")) {
    foreach ($Hive in @("HKCU:", "HKLM:")) {
      $RegPath = "$Hive\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\$ExeName"
      if (Test-Path $RegPath) {
        $Val = (Get-ItemProperty -Path $RegPath -ErrorAction SilentlyContinue)."(default)"
        if ($Val -and (Test-Path $Val)) {
          $BrowserPath = $Val
          break
        }
      }
    }
    if ($BrowserPath) { break }
    $Cmd = Get-Command $ExeName -ErrorAction SilentlyContinue
    if ($Cmd -and $Cmd.Source -and (Test-Path $Cmd.Source)) {
      $BrowserPath = $Cmd.Source
      break
    }
  }
}

$LaunchBatch = if ($BrowserPath) {
  "@echo off\`r\`nstart \`"\`" \`"$BrowserPath\`" --app=\`"$AppUrl\`" --new-window\`r\`n"
} else {
  "@echo off\`r\`nstart \`"\`" \`"$AppUrl\`"\`r\`n"
}
Set-Content -Path $LaunchCmdDest -Value $LaunchBatch -Encoding ASCII

$StartMenuDir = Join-Path $env:APPDATA "Microsoft\\Windows\\Start Menu\\Programs"
$StartupDir = [Environment]::GetFolderPath("Startup")
$DesktopDir = [Environment]::GetFolderPath("Desktop")
$StartMenuShortcut = Join-Path $StartMenuDir "$AppName.lnk"
$DesktopShortcut = Join-Path $DesktopDir "$AppName.lnk"
$StartupShortcut = Join-Path $StartupDir "$AppName.lnk"

$ShortcutTargets = @($StartMenuShortcut, $DesktopShortcut)
if ($AutoStartOnLogin -and $StartupDir) {
  $ShortcutTargets += $StartupShortcut
}

if ($BrowserPath) {
  $WshShell = New-Object -ComObject WScript.Shell
  foreach ($ShortcutPath in $ShortcutTargets) {
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $BrowserPath
    $Shortcut.Arguments = "--app=\`"$AppUrl\`" --new-window"
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.Description = "Executive Term - Presidential Strategy Simulator"
    if (Test-Path $IconDest) {
      $Shortcut.IconLocation = "$IconDest,0"
    }
    $Shortcut.Save()
  }
} else {
  $UrlContent = @"
[InternetShortcut]
URL=$AppUrl
IconFile=$IconDest
IconIndex=0
"@
  Set-Content -Path (Join-Path $StartMenuDir "$AppName.url") -Value $UrlContent -Encoding ASCII
  Set-Content -Path (Join-Path $DesktopDir "$AppName.url") -Value $UrlContent -Encoding ASCII
  if ($AutoStartOnLogin -and $StartupDir) {
    Set-Content -Path (Join-Path $StartupDir "$AppName.url") -Value $UrlContent -Encoding ASCII
  }
}

$UninstallKey = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ExecutiveTerm"
New-Item -Path $UninstallKey -Force | Out-Null
Set-ItemProperty -Path $UninstallKey -Name "DisplayName" -Value $AppName
Set-ItemProperty -Path $UninstallKey -Name "DisplayVersion" -Value "1.0.0"
Set-ItemProperty -Path $UninstallKey -Name "Publisher" -Value "Executive Term"
Set-ItemProperty -Path $UninstallKey -Name "InstallLocation" -Value $InstallDir
Set-ItemProperty -Path $UninstallKey -Name "URLInfoAbout" -Value $AppUrl
Set-ItemProperty -Path $UninstallKey -Name "NoModify" -Value 1 -Type DWord
Set-ItemProperty -Path $UninstallKey -Name "NoRepair" -Value 1 -Type DWord
Set-ItemProperty -Path $UninstallKey -Name "EstimatedSize" -Value 1024 -Type DWord
if (Test-Path $IconDest) {
  Set-ItemProperty -Path $UninstallKey -Name "DisplayIcon" -Value $IconDest
}
Set-ItemProperty -Path $UninstallKey -Name "UninstallString" -Value "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \`"$UninstallPs1Dest\`""
Set-ItemProperty -Path $UninstallKey -Name "QuietUninstallString" -Value "powershell.exe -NoProfile -ExecutionPolicy Bypass -NonInteractive -File \`"$UninstallPs1Dest\`" -Quiet"

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host " - Added to Windows 11 Start Menu and Desktop"
if ($AutoStartOnLogin) {
  Write-Host " - Enabled automatic launch at Windows sign-in"
}
Write-Host " - Registered in Settings > Apps > Installed apps"
if ($BrowserPath) {
  Write-Host " - Desktop window launcher: $BrowserPath"
} else {
  Write-Host " - Launcher URL: $AppUrl"
}
Write-Host ""
Write-Host "Starting Executive Term automatically..." -ForegroundColor Cyan

try {
  if ($BrowserPath) {
    Start-Process -FilePath $BrowserPath -ArgumentList @("--app=$AppUrl", "--new-window")
  } else {
    Start-Process -FilePath "explorer.exe" -ArgumentList $AppUrl
  }
} catch {
  Start-Process -FilePath "explorer.exe" -ArgumentList $AppUrl
}
`;

  const uninstallPs1 = `param([switch]$Quiet)
$ErrorActionPreference = "SilentlyContinue"

$AppName = "Executive Term"
$InstallDir = Join-Path $env:LOCALAPPDATA "ExecutiveTerm"
$StartMenuDir = Join-Path $env:APPDATA "Microsoft\\Windows\\Start Menu\\Programs"
$StartupDir = [Environment]::GetFolderPath("Startup")
$DesktopDir = [Environment]::GetFolderPath("Desktop")
$UninstallKey = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ExecutiveTerm"

foreach ($ShortcutPath in @(
  (Join-Path $StartMenuDir "$AppName.lnk"),
  (Join-Path $StartMenuDir "$AppName.url"),
  (Join-Path $DesktopDir "$AppName.lnk"),
  (Join-Path $DesktopDir "$AppName.url"),
  (Join-Path $StartupDir "$AppName.lnk"),
  (Join-Path $StartupDir "$AppName.url")
)) {
  if ($ShortcutPath -and (Test-Path $ShortcutPath)) { Remove-Item -Path $ShortcutPath -Force }
}
if (Test-Path $UninstallKey) { Remove-Item -Path $UninstallKey -Recurse -Force }

if (Test-Path $InstallDir) {
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c ping 127.0.0.1 -n 2 >nul & rmdir /s /q \`"$InstallDir\`"" -WindowStyle Hidden
}

if (-not $Quiet) {
  Write-Host "Executive Term has been uninstalled from Windows 11." -ForegroundColor Green
}
`;

  const readmeTxt = `Executive Term — Windows 11 Desktop Installer
===============================================

How to Install on Windows 11:
1. Extract this ZIP folder (right-click -> Extract All...).
2. Open the extracted folder and double-click:
   Install Executive Term.cmd
3. Executive Term will install and start automatically in its own standalone window.

What the Installer Does:
- Installs Executive Term into %LOCALAPPDATA%\\ExecutiveTerm with its desktop icon.
- Creates Windows 11 Start Menu and Desktop shortcuts that launch Executive Term
  in its own standalone desktop window (${safeOrigin}).
- Automatically launches Executive Term upon completing installation.
- Registers Executive Term under Windows 11 Settings > Apps > Installed apps so
  you can cleanly uninstall anytime (or run Uninstall Executive Term.cmd).
`;

  const entries: ZipEntryInput[] = [
    { name: 'Install Executive Term.cmd', data: toCRLF(installCmd) },
    { name: 'Uninstall Executive Term.cmd', data: toCRLF(uninstallCmd) },
    { name: 'README.txt', data: toCRLF(readmeTxt) },
    { name: 'app/install.ps1', data: toCRLF(installPs1) },
    { name: 'app/uninstall.ps1', data: toCRLF(uninstallPs1) },
    { name: 'app/Uninstall Executive Term.cmd', data: toCRLF(installedUninstallCmd) },
  ];

  if (icoBuffer && icoBuffer.length > 0) {
    entries.push({ name: 'app/ExecutiveTerm.ico', data: icoBuffer });
  }

  return buildZipArchive(entries);
}

