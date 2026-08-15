# Extract songs from Android Kotlin file and convert to JSON for Web App
$src = "C:\Users\User\.gemini\antigravity-ide\scratch\TuneTastic\app\src\main\java\com\tunetastic\app\data\SongRepository.kt"
$dst = "C:\Users\User\.gemini\antigravity-ide\scratch\TuneTasticWeb\src\data\songs.json"

# Ensure data directory exists
$dataDir = "C:\Users\User\.gemini\antigravity-ide\scratch\TuneTasticWeb\src\data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

$content = Get-Content $src -Raw -Encoding UTF8
$matches = [System.Text.RegularExpressions.Regex]::Matches($content, 'Song\(id="([^"]+)", title="([^"]+)", artist="([^"]+)", album="([^"]+)", durationMs=(\d+), audioId="([^"]+)"\)')

$songs = @()
foreach ($m in $matches) {
    $songs += @{
        id = $m.Groups[1].Value
        title = $m.Groups[2].Value
        artist = $m.Groups[3].Value
        album = $m.Groups[4].Value
        durationMs = [int]$m.Groups[5].Value
        audioId = $m.Groups[6].Value
    }
}

$songs | ConvertTo-Json -Depth 3 | Out-File -FilePath $dst -Encoding UTF8

Write-Host "SUCCESS! Transferred $($songs.Count) songs to web app (songs.json)!" -ForegroundColor Green
