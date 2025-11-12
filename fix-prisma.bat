@echo off
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Regenerating Prisma Client...
npx prisma generate
echo.
echo Database schema is now synced!
echo You can now restart the dev server with: npm run dev
pause

