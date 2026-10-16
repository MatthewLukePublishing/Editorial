function Start-HiddenPowerShell {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string]$ScriptPath,
        [Parameter(Mandatory)] [hashtable]$Parameters,
        [Parameter(Mandatory)] [string]$LogDirectory
    )
    if ($env:OS -ne 'Windows_NT') { throw 'Hidden background runs require Windows.' }
    $scriptFile = Get-Item -LiteralPath $ScriptPath -ErrorAction Stop
    $powerShellExecutable = Join-Path $PSHOME 'pwsh.exe'
    if (-not (Test-Path -LiteralPath $powerShellExecutable -PathType Leaf)) {
        $powerShellExecutable = Join-Path $PSHOME 'powershell.exe'
    }
    if (-not (Test-Path -LiteralPath $powerShellExecutable -PathType Leaf)) {
        throw 'Could not locate the current PowerShell executable.'
    }
    $serializedParameters = @{}
    foreach ($parameterName in $Parameters.Keys) {
        $parameterValue = $Parameters[$parameterName]
        if ($parameterValue -is [Management.Automation.SwitchParameter]) {
            $parameterValue = [bool]$parameterValue
        }
        $serializedParameters[$parameterName] = $parameterValue
    }
    $runId = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ') + '-' + [Guid]::NewGuid().ToString('N')
    $runDirectory = Join-Path ([IO.Path]::GetFullPath($LogDirectory)) $runId
    $stdoutPath = Join-Path $runDirectory 'stdout.log'
    $stderrPath = Join-Path $runDirectory 'stderr.log'
    $statusPath = Join-Path $runDirectory 'status.json'
    $launchConfiguration = @{
        scriptPath = $scriptFile.FullName
        workingDirectory = (Get-Location).ProviderPath
        parameters = $serializedParameters
        statusPath = $statusPath
    }
    $payload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(($launchConfiguration | ConvertTo-Json -Depth 10 -Compress)))
    # All user values travel as JSON data; none are interpolated as PowerShell code.
    $worker = @'
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
$configuration = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('__PAYLOAD__')) | ConvertFrom-Json
function Write-RunStatus([string]$State, [int]$ExitCode) {
    $status = @{ state=$State; processId=$PID; exitCode=$ExitCode; updatedAt=[DateTime]::UtcNow.ToString('o') }
    $temporaryPath = $configuration.statusPath + '.tmp'
    [IO.File]::WriteAllText($temporaryPath, ($status | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
    if ([IO.File]::Exists($configuration.statusPath)) {
        [IO.File]::Replace($temporaryPath, $configuration.statusPath, [NullString]::Value)
    } else {
        [IO.File]::Move($temporaryPath, $configuration.statusPath)
    }
}
try {
    Write-RunStatus 'Running' 0
    Set-Location -LiteralPath $configuration.workingDirectory
    $arguments = @{}
    foreach ($property in $configuration.parameters.PSObject.Properties) { $arguments[$property.Name] = $property.Value }
    & $configuration.scriptPath @arguments
    Write-RunStatus 'Succeeded' 0
    exit 0
} catch {
    [Console]::Error.WriteLine($_.ToString())
    Write-RunStatus 'Failed' 1
    exit 1
}
'@
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($worker.Replace('__PAYLOAD__', $payload)))
    if ($encodedCommand.Length -gt 30000) { throw 'Background launch parameters exceed the Windows command-line limit.' }
    [void][IO.Directory]::CreateDirectory($runDirectory)
    $startParameters = @{
        FilePath = $powerShellExecutable
        ArgumentList = @('-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-OutputFormat', 'Text', '-EncodedCommand', $encodedCommand)
        WorkingDirectory = $launchConfiguration.workingDirectory
        WindowStyle = 'Hidden'
        RedirectStandardOutput = $stdoutPath
        RedirectStandardError = $stderrPath
        PassThru = $true
    }
    try {
        $process = Start-Process @startParameters
    } catch {
        [IO.File]::WriteAllText($statusPath, '{"state":"LaunchFailed","exitCode":1}')
        throw
    }
    return [pscustomobject]@{
        ProcessId = $process.Id
        StdoutPath = $stdoutPath
        StderrPath = $stderrPath
        StatusPath = $statusPath
    }
}
