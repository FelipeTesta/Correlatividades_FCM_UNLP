param(
    [string]$Message = "deploy: update",
    [switch]$NoPush
)

# 1. Stage all changes
git add -A

# 2. Commit code changes if any exist
$status = git status --porcelain
if ($status) {
    git commit -m $Message
}

# 3. Get current short commit hash
$hash = git rev-parse --short HEAD

# 4. Update version.json with hash + current UTC timestamp
$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$json = '{"version":"' + $hash + '","timestamp":"' + $ts + '"}'
Set-Content -Path "version.json" -Value $json -NoNewline -Encoding UTF8

# 5. Commit version.json bump
git add version.json
git commit -m "chore: bump version to $hash"

# 6. Push to origin main (unless -NoPush)
if (-not $NoPush) {
    git push origin main
}