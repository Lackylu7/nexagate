param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$ApiToken,

    [string]$Model = "deepseek-chat"
)

$ErrorActionPreference = "Stop"

$base = $BaseUrl.TrimEnd("/")
$authHeaders = @{
    Authorization = "Bearer $ApiToken"
}

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message"
}

Write-Step "Checking NexaGate healthz"
Invoke-RestMethod -Method Get -Uri "$base/healthz" | ConvertTo-Json -Depth 8

Write-Step "Checking NexaGate upstream health"
Invoke-RestMethod -Method Get -Uri "$base/nexa/health" | ConvertTo-Json -Depth 8

Write-Step "Checking model list"
Invoke-RestMethod -Method Get -Uri "$base/v1/models" -Headers $authHeaders | ConvertTo-Json -Depth 8

Write-Step "Checking chat completions"
$chatHeaders = @{
    Authorization  = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

$body = @{
    model    = $Model
    messages = @(
        @{
            role    = "user"
            content = "Reply with exactly: gateway-ok"
        }
    )
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method Post -Uri "$base/v1/chat/completions" -Headers $chatHeaders -Body $body | ConvertTo-Json -Depth 8

Write-Host ""
Write-Host "NexaGate smoke test finished."
