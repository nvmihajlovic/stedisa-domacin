$content = Get-Content "app\groups\page.tsx" -Raw
$marker = "        {/* Members Section */"
$insert = @"
        {/* Statistics Section */}
        <GroupStatistics
          categoryExpenses={categoryExpenses}
          categoryIncomes={categoryIncomes}
          transactions={transactions}
        />

"@
$content = $content.Replace($marker, $insert + $marker)
Set-Content "app\groups\page.tsx" -Value $content
Write-Host "Dodata GroupStatistics komponenta"
