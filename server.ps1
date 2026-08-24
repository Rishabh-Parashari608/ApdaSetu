# Simple PowerShell HTTP Server for ApdaSetu
param(
    [int]$Port = 8080
)

$port = $Port
$path = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Output "ApdaSetu Server started on http://localhost:$port/"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        if ($request.HttpMethod -eq "POST" -and $request.Url.LocalPath -eq "/api/chat") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $payload = $reader.ReadToEnd() | ConvertFrom-Json
                $query = [string]$payload.query
                if ([string]::IsNullOrWhiteSpace($query)) { throw "Query message is required." }

                $responseText = "Follow instructions from official local emergency managers. For immediate danger, call 112 or use the ApdaSetu SOS report."
                if ($query -match "shelter|safe area|evacuat") {
                    $responseText = "Open the Shelter Map in your citizen dashboard to view verified shelter locations, live vacancy, facilities, and safe routes. Do not travel through flooded or blocked roads."
                } elseif ($query -match "flood|water|rain") {
                    $responseText = "Flood safety alert: move to higher ground, avoid roads near low-lying drains, never walk or drive through floodwater, and switch off electricity only if it is safe."
                } elseif ($query -match "hospital|medical|doctor|injur|ambulance") {
                    $responseText = "For urgent medical help, call 108. Keep the injured person safe and still, share your location, and do not move someone with suspected head, neck, or spine injuries unless they face immediate danger."
                }

                $body = @{ query = $query; response = $responseText; timestamp = [DateTime]::UtcNow.ToString("o"); source = "ApdaSetu Emergency KB" } | ConvertTo-Json -Compress
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"Please send a valid chat message."}')
                $response.StatusCode = 400
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq '') {
            $localPath = "index.html"
        }

        $filePath = Join-Path $path $localPath
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".woff2" { "font/woff2" }
                Default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Output "Server stopped: $_"
} finally {
    $listener.Stop()
}
