# PowerShell Script za automatsko pozivanje recurring transactions
# Pokreće se svaki dan u 00:01 preko Windows Task Scheduler-a

$ErrorActionPreference = "Stop"

# Configuration
$API_URL = "http://localhost:3000/api/recurring/process"
$SECRET_KEY = "your-secret-key-here"  # Promeni ovo sa pravim secret key-em
$LOG_FILE = "$PSScriptRoot\recurring-cron.log"

# Log function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

try {
    Write-Log "🔄 Starting recurring transactions processing..."
    
    # Call API endpoint
    $headers = @{
        "Authorization" = "Bearer $SECRET_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -TimeoutSec 60
    
    # Log results
    Write-Log "✅ Processing completed successfully"
    Write-Log "   Expenses created: $($response.expenses.created)"
    Write-Log "   Expenses errors: $($response.expenses.errors)"
    Write-Log "   Incomes created: $($response.incomes.created)"
    Write-Log "   Incomes errors: $($response.incomes.errors)"
    Write-Log "   Processed at: $($response.processedAt)"
    
    exit 0
    
} catch {
    Write-Log "❌ Error processing recurring transactions: $_"
    Write-Log "   Stack trace: $($_.Exception.StackTrace)"
    exit 1
}
