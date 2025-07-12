@echo off
echo Setting up deployment files...

echo.
echo Checking if Git is initialized...
if not exist .git (
    echo Initializing Git repository...
    git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

echo.
echo Adding files to Git...
git add .
git status

echo.
echo Files have been added to Git staging area.
echo.
echo Next steps:
echo 1. Commit your changes: git commit -m "Add deployment configuration files"
echo 2. Add your GitHub repository as remote: git remote add origin https://github.com/yourusername/yourrepo.git
echo 3. Push to GitHub: git push -u origin main
echo 4. Follow the DEPLOYMENT_GUIDE.md for complete deployment instructions
echo.
echo Deployment files created successfully!
echo.
echo Created files:
echo - .env.example (backend environment variables)
echo - .env.production (backend production config)
echo - frontend/.env.example (frontend environment variables)
echo - frontend/.env.production (frontend production config)
echo - render.yaml (Render.com configuration)
echo - netlify.toml (Netlify configuration)
echo - frontend/netlify.toml (Alternative Netlify config)
echo - DEPLOYMENT_GUIDE.md (Complete deployment guide)
echo.
pause
