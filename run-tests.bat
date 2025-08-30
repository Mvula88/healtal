@echo off
echo InnerRoot Platform - Playwright Test Runner
echo ============================================
echo.
echo Choose test option:
echo 1. Run all tests (headless)
echo 2. Run tests with UI (interactive)
echo 3. Run tests in debug mode
echo 4. Show test report
echo 5. Run specific test file
echo 6. Run tests in headed mode (see browser)
echo.

set /p choice="Enter choice (1-6): "

if "%choice%"=="1" (
    echo Running all tests...
    call npm test
) else if "%choice%"=="2" (
    echo Opening Playwright UI...
    call npm run test:ui
) else if "%choice%"=="3" (
    echo Running tests in debug mode...
    call npm run test:debug
) else if "%choice%"=="4" (
    echo Opening test report...
    call npm run test:report
) else if "%choice%"=="5" (
    set /p file="Enter test file name (auth, dashboard, admin, or public-pages): "
    echo Running %file% tests...
    call npx playwright test tests/e2e/%file%.spec.ts
) else if "%choice%"=="6" (
    echo Running tests in headed mode...
    call npx playwright test --headed
) else (
    echo Invalid choice
)

echo.
pause