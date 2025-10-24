# WagerVS Supabase + Vercel Deployment Script (PowerShell)
# This script helps automate the deployment process

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host "WagerVS Migration to Supabase + Vercel" -ForegroundColor Blue
    Write-Host "Usage: .\deploy.ps1 [-SkipTests] [-SkipBuild] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipTests    Skip local connection tests"
    Write-Host "  -SkipBuild    Skip building the project"
    Write-Host "  -Help         Show this help message"
    exit 0
}

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "Git is not installed. Please install Git first."
        exit 1
    }
    
    Write-Success "All dependencies are installed"
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    Set-Location wager-backend
    npm install
    Set-Location ..
    
    Write-Success "Dependencies installed"
}

# Build the project
function Build-Project {
    if ($SkipBuild) {
        Write-Status "Skipping build (SkipBuild flag set)"
        return
    }
    
    Write-Status "Building project..."
    
    Set-Location wager-backend
    npm run build
    Set-Location ..
    
    Write-Success "Project built successfully"
}

# Check environment variables
function Test-EnvironmentVariables {
    Write-Status "Checking environment variables..."
    
    if (-not (Test-Path "wager-backend\.env")) {
        Write-Warning "Environment file not found. Please create wager-backend\.env from env.supabase.template"
        Write-Status "Copying template..."
        Copy-Item "wager-backend\env.supabase.template" "wager-backend\.env"
        Write-Warning "Please edit wager-backend\.env with your Supabase credentials"
        return $false
    }
    
    # Load environment variables
    $envFile = "wager-backend\.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
    
    # Check for required variables
    if (-not $env:SUPABASE_URL) {
        Write-Error "SUPABASE_URL is not set in .env file"
        return $false
    }
    
    if (-not $env:SUPABASE_ANON_KEY) {
        Write-Error "SUPABASE_ANON_KEY is not set in .env file"
        return $false
    }
    
    if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
        Write-Error "SUPABASE_SERVICE_ROLE_KEY is not set in .env file"
        return $false
    }
    
    Write-Success "Environment variables are configured"
    return $true
}

# Test local connection
function Test-LocalConnection {
    if ($SkipTests) {
        Write-Status "Skipping connection test (SkipTests flag set)"
        return
    }
    
    Write-Status "Testing local connection..."
    
    Set-Location wager-backend
    
    # Start server in background
    $job = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    # Wait for server to start
    Start-Sleep -Seconds 5
    
    try {
        # Test health endpoint
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Local server is running"
        } else {
            Write-Error "Local server returned status code: $($response.StatusCode)"
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -ErrorAction SilentlyContinue
            Set-Location ..
            return $false
        }
    } catch {
        Write-Error "Local server failed to start: $($_.Exception.Message)"
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        Set-Location ..
        return $false
    } finally {
        # Stop server
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
    }
    
    Set-Location ..
    return $true
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Status "Deploying to Vercel..."
    
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Status "Installing Vercel CLI..."
        npm install -g vercel
    }
    
    # Check if logged in to Vercel
    try {
        vercel whoami | Out-Null
    } catch {
        Write-Status "Please login to Vercel..."
        vercel login
    }
    
    # Deploy
    Set-Location wager-backend
    vercel --prod
    Set-Location ..
    
    Write-Success "Deployed to Vercel"
}

# Main execution
function Main {
    Write-Host "🚀 WagerVS Migration to Supabase + Vercel" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    
    Write-Status "Starting migration process..."
    
    Test-Dependencies
    Install-Dependencies
    Build-Project
    
    if (Test-EnvironmentVariables) {
        Test-LocalConnection
    } else {
        Write-Warning "Skipping connection test due to missing environment variables"
    }
    
    Write-Host ""
    Write-Status "Migration setup complete!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Set up your Supabase project (see MIGRATION_GUIDE.md)"
    Write-Host "2. Update wager-backend\.env with your Supabase credentials"
    Write-Host "3. Run the database migration SQL in Supabase"
    Write-Host "4. Deploy to Vercel: vercel --prod"
    Write-Host ""
    Write-Status "For detailed instructions, see MIGRATION_GUIDE.md"
}

# Run main function
Main
