$ErrorActionPreference = "Stop"

Write-Host "Checking git status..."
if (!(Test-Path ".git")) {
    Write-Host "Initializing new git repository..."
    git init
    git branch -M main
}

Write-Host "Creating 10 logical commits for Phase 1-3 progress..."

# Commit 1: Core config files
git add .gitignore README.md progress.txt cineflow/docker-compose.yml
git commit -m "chore: setup project documentation and base docker-compose infrastructure"

# Commit 2: Shared Utilities
git add cineflow/shared/package.json cineflow/shared/middleware
git commit -m "feat(shared): add token verification middleware and common utilities"

# Commit 3: API Gateway
git add cineflow/services/api-gateway
git commit -m "feat(api-gateway): implement api gateway with redis rate limiting"

# Commit 4: User Service
git add cineflow/services/user-service
git commit -m "feat(user-service): implement user authentication and postgres integration"

# Commit 5: Movie Service
git add cineflow/services/movie-service
git commit -m "feat(movie-service): implement movie catalog and show management"

# Commit 6: Movie Service Cache Optimization
git add cineflow/services/movie-service/src/services/movie.service.js
git commit -m "perf(movie-service): add redis caching and non-blocking SCAN cache invalidation"

# Commit 7: Booking Service Core
git add cineflow/services/booking-service
git commit -m "feat(booking-service): implement seat locking mechanism using redis SET NX EX"

# Commit 8: Kafka Shared Infrastructure
git add cineflow/shared/kafka
git commit -m "feat(shared): add kafka client, generic producer, and consumer wrappers"

# Commit 9: Payment Service & Notification Service
git add cineflow/services/payment-service cineflow/services/notification-service
git commit -m "feat(workers): implement payment processing and notification event workers"

# Commit 10: Asynchronous Booking Architecture
git add cineflow/services/booking-service/src/events
git commit -m "refactor(booking-service): transition to asynchronous event-driven booking flow"

# Final sweep just in case there are other files left behind
git add .
git commit -m "chore: final cleanup and missing configuration files for phase 3"

Write-Host "--------------------------------------------------------"
Write-Host "Commits created successfully! Run 'git log --oneline' to view them."
Write-Host "To push to GitHub, run:"
Write-Host "git remote add origin <your-github-repo-url>"
Write-Host "git push -u origin main"
Write-Host "--------------------------------------------------------"
