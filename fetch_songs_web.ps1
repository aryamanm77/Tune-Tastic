$cloudName = "rgnz1qq3"
$apiKey = "779872826233131"
$apiSecret = "jTNafKz1_NkDQQr8pdXWo85qeJg"

$baseUrl = "https://api.cloudinary.com/v1_1/$cloudName/resources/video"
$authBytes = [System.Text.Encoding]::ASCII.GetBytes("${apiKey}:${apiSecret}")
$authHeader = "Basic " + [Convert]::ToBase64String($authBytes)

Write-Host "Fetching songs from Cloudinary..." -ForegroundColor Cyan

$allSongs = @()
$nextCursor = $null

do {
    $url = "$baseUrl?max_results=500"
    if ($nextCursor) { $url += "&next_cursor=$nextCursor" }

    try {
        $response = Invoke-RestMethod -Uri $url -Headers @{ Authorization = $authHeader } -Method Get
        foreach ($resource in $response.resources) {
            $allSongs += $resource
        }
        $nextCursor = $response.next_cursor
        Write-Host "  Fetched $($allSongs.Count) songs..."
    } catch {
        Write-Host "Error fetching from Cloudinary: $_" -ForegroundColor Red
        exit
    }
} while ($nextCursor)

Write-Host "Total songs found: $($allSongs.Count)" -ForegroundColor Green

$jsonSongs = @()
foreach ($song in $allSongs) {
    # Generate clean title (remove underscores and track numbers)
    $cleanTitle = $song.public_id -replace "^music/", ""
    $cleanTitle = $cleanTitle -replace "_", " "
    $cleanTitle = $cleanTitle -replace "^[0-9]+\s*", ""
    $cleanTitle = $cleanTitle -replace "www\..*?\.com", ""
    $cleanTitle = $cleanTitle -replace "\.mp3$", ""
    
    $jsonSongs += @{
        id = [guid]::NewGuid().ToString()
        title = $cleanTitle.Trim()
        artist = "Unknown Artist"
        album = "Unknown Album"
        durationMs = [math]::Round($song.duration * 1000)
        audioId = $song.public_id
    }
}

# Convert to JSON and save without BOM to prevent errors
$json = $jsonSongs | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText("C:\Users\User\.gemini\antigravity-ide\scratch\TuneTasticWeb\src\data\songs.json", $json)

Write-Host "SUCCESS! Automatically generated songs.json for Web App!" -ForegroundColor Green
Write-Host "Next step: Run 'node enrich.js' to grab real album covers!" -ForegroundColor Yellow
