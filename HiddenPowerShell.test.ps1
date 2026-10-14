[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { Write-Output 'HIDDEN_POWERSHELL_TEST_SKIPPED|requires=Windows'; return }
$programRoot = $PSScriptRoot
. (Join-Path $programRoot 'HiddenPowerShell.ps1')
$fixtureRoot = Join-Path $programRoot ('.tmp\hidden-powershell-' + [Guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($fixtureRoot)
$fixtureScript = Join-Path $fixtureRoot "worker's script.ps1"
$releasePath = Join-Path $fixtureRoot 'release'
$workerProcesses = @()
$fixture = @'
param([string]$Text, [int]$Count, [switch]$Flag, [switch]$Fail, [string]$ReleasePath)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class ConsoleVisibilityTest { [DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow(); [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window); }'
$report = @{
    text=$Text; count=$Count; flag=[bool]$Flag; directory=(Get-Location).ProviderPath
    consoleVisible=[ConsoleVisibilityTest]::IsWindowVisible([ConsoleVisibilityTest]::GetConsoleWindow())
}
Write-Output ($report | ConvertTo-Json -Compress)
Write-Host 'SYNTHETIC_PROGRESS'
[Console]::Error.WriteLine('SYNTHETIC_STDERR')
if ($ReleasePath) {
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    while (-not (Test-Path -LiteralPath $ReleasePath)) {
        if ([DateTime]::UtcNow -gt $deadline) { throw 'Synthetic release timeout.' }
        Start-Sleep -Milliseconds 50
    }
}
if ($Fail) { throw 'SYNTHETIC_FAILURE' }
'@
Set-Content -LiteralPath $fixtureScript -Value $fixture -Encoding UTF8
function Wait-Worker([int]$ProcessId) {
    $workerProcess = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($workerProcess -and -not $workerProcess.WaitForExit(20000)) { throw 'Synthetic hidden worker did not finish.' }
}
try {
    $text = 'quote''s "double"; $(Write-Error injected) ' + [char]0x00E9 + [char]0x202F
    $run = Start-HiddenPowerShell -ScriptPath $fixtureScript -Parameters @{
        Text=$text; Count=17; Flag=[Management.Automation.SwitchParameter]::new($true); ReleasePath=$releasePath
    } -LogDirectory (Join-Path $fixtureRoot 'runs')
    $workerProcesses += $run.ProcessId
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    while (-not (Test-Path -LiteralPath $run.StatusPath)) {
        if ([DateTime]::UtcNow -gt $deadline) { throw 'Hidden worker did not record startup.' }
        Start-Sleep -Milliseconds 50
    }
    $running = Get-Content -LiteralPath $run.StatusPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($running.state -ne 'Running') { throw 'Launcher must return while the worker is still running.' }
    [IO.File]::WriteAllText($releasePath, 'release')
    Wait-Worker $run.ProcessId
    $status = Get-Content -LiteralPath $run.StatusPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $stdout = Get-Content -LiteralPath $run.StdoutPath -Raw -Encoding UTF8
    $stderr = Get-Content -LiteralPath $run.StderrPath -Raw -Encoding UTF8
    $report = ($stdout -split '\r?\n' | Where-Object { $_.StartsWith('{') } | Select-Object -First 1) | ConvertFrom-Json
    if ($status.state -ne 'Succeeded' -or $status.exitCode -ne 0 -or $status.processId -ne $run.ProcessId) { throw 'Successful worker status was lost.' }
    if ($report.text -cne $text -or $report.count -ne 17 -or -not $report.flag) { throw 'Quoted/Unicode/typed arguments did not round-trip.' }
    if ($report.directory -ne (Get-Location).ProviderPath -or $report.consoleVisible) { throw 'Worker directory or hidden-window contract failed.' }
    if ($stdout -notmatch 'SYNTHETIC_PROGRESS' -or $stderr -notmatch 'SYNTHETIC_STDERR') { throw 'Progress/error logs were lost.' }
    $failedRun = Start-HiddenPowerShell -ScriptPath $fixtureScript -Parameters @{ Fail=$true } -LogDirectory (Join-Path $fixtureRoot 'runs')
    $workerProcesses += $failedRun.ProcessId
    Wait-Worker $failedRun.ProcessId
    $failedStatus = Get-Content -LiteralPath $failedRun.StatusPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($failedStatus.state -ne 'Failed' -or $failedStatus.exitCode -ne 1 -or
        (Get-Content -LiteralPath $failedRun.StderrPath -Raw -Encoding UTF8) -notmatch 'SYNTHETIC_FAILURE') { throw 'Failure was reported as success or diagnostics were lost.' }
    Write-Output 'HIDDEN_POWERSHELL_TEST_OK|cases=2|visibleWindows=0|adobeCalls=0|networkCalls=0'
} finally {
    [IO.File]::WriteAllText($releasePath, 'release')
    foreach ($workerProcessId in $workerProcesses) { Wait-Worker $workerProcessId }
    $resolvedFixture = [IO.Path]::GetFullPath($fixtureRoot)
    $scratchPrefix = [IO.Path]::GetFullPath((Join-Path $programRoot '.tmp')).TrimEnd('\') + '\'
    $cleanupItems = @(Get-Item -LiteralPath $resolvedFixture) + @(Get-ChildItem -LiteralPath $resolvedFixture -Recurse -Force)
    $reparsePoints = $cleanupItems |
        Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
    if (-not $resolvedFixture.StartsWith($scratchPrefix, [StringComparison]::OrdinalIgnoreCase) -or $reparsePoints) { throw 'Unsafe fixture cleanup boundary.' }
    Add-Type -AssemblyName Microsoft.VisualBasic
    [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($resolvedFixture,
        [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs,
        [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin)
    if (Test-Path -LiteralPath $resolvedFixture) { throw 'Synthetic fixture was not recycled.' }
}
