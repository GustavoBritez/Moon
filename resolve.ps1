$filePath = ".\Niveles\Enemigo\EnemyManager.js"
$content = Get-Content -Path $filePath -Raw
$lines = $content -split "`r?`n"
$result = @()
$keeping = $true

foreach ($line in $lines) {
    if ($line.StartsWith("<<<<<<<")) {
        $keeping = $true
        continue
    } elseif ($line.StartsWith("=======")) {
        $keeping = $false
        continue
    } elseif ($line.StartsWith(">>>>>>>")) {
        $keeping = $true
        continue
    }
    
    if ($keeping) {
        $result += $line
    }
}

$result -join "`n" | Set-Content -Path $filePath -NoNewline
Write-Host "Conflicto resuelto en Nivel_1.js guardando HEAD."
