# PowerShell script to run Playwright tests

Write-Host "InnerRoot Platform - Playwright Test Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose test option:" -ForegroundColor Yellow
Write-Host "1. Run all tests (headless)"
Write-Host "2. Run tests with UI (interactive)"
Write-Host "3. Run tests in debug mode"
Write-Host "4. Show test report"
Write-Host "5. Run specific test file"
Write-Host "6. Run tests in headed mode (see browser)"
Write-Host ""

$choice = Read-Host "Enter choice (1-6)"

switch ($choice) {
    1 { 
        Write-Host "Running all tests..." -ForegroundColor Green
        npm test
    }
    2 { 
        Write-Host "Opening Playwright UI..." -ForegroundColor Green
        npm run test:ui
    }
    3 { 
        Write-Host "Running tests in debug mode..." -ForegroundColor Green
        npm run test:debug
    }
    4 { 
        Write-Host "Opening test report..." -ForegroundColor Green
        npm run test:report
    }
    5 { 
        $file = Read-Host "Enter test file name (e.g., auth, dashboard, admin, public-pages)"
        Write-Host "Running $file tests..." -ForegroundColor Green
        npx playwright test "tests/e2e/$file.spec.ts"
    }
    6 { 
        Write-Host "Running tests in headed mode..." -ForegroundColor Green
        npx playwright test --headed
    }
    default { 
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")