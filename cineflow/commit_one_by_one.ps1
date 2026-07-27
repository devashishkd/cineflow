$gitRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $gitRoot

# Use -uall so it lists files inside the frontend folder individually instead of grouping them
$files = git status -uall --porcelain | ForEach-Object { $_.Substring(3).Trim(' "') }

$count = 0
foreach ($file in $files) {
    if (-not [string]::IsNullOrWhiteSpace($file)) {
        Write-Host "Committing $file..."
        git add "`"$file`""
        git commit -m "Update $file"
        $count++
    }
}

Write-Host "Created $count commits. Pushing to GitHub..."
git push

Write-Host "Done!"
