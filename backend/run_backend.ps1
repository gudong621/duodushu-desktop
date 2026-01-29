# Check if python is available
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Error "Python not found. Please install Python 3.10+ and add it to PATH."
    exit 1
}

$BackendDir = $PSScriptRoot
Set-Location $BackendDir

# Create venv if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate venv
$VenvScript = ".\venv\Scripts\Activate.ps1"
if (Test-Path $VenvScript) {
    . $VenvScript
} else {
    Write-Error "Virtual environment script not found at $VenvScript"
    exit 1
}

# Install dependencies
if (Test-Path "requirements.txt") {
    Write-Host "Installing/Updating dependencies..."
    pip install -r requirements.txt
}

# Set PYTHONPATH to current directory so 'app' module can be found
$env:PYTHONPATH = $BackendDir

# Start Server
Write-Host "Starting Backend Server on http://localhost:8000..."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
