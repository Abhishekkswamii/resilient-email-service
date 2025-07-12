# Deployment Guide: Render.com + Netlify

This guide will help you deploy your Resilient Email Service with:
- **Backend**: Render.com (Node.js/Express API)
- **Frontend**: Netlify (React Dashboard)

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Render.com account (sign up at https://render.com)
3. Netlify account (sign up at https://netlify.com)

## Step 1: Prepare Your Repository

Make sure your repository is pushed to GitHub with all the files we just created:
- `.env.example` (backend environment variables)
- `frontend/.env.example` (frontend environment variables)
- `render.yaml` (Render.com configuration)
- `netlify.toml` (Netlify configuration)

## Step 2: Deploy Backend to Render.com

### 2.1 Create New Web Service
1. Go to your Render.com dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select your repository

### 2.2 Configure Build Settings
```
Name: resilient-email-service
Environment: Node
Region: Oregon (US West) or your preferred region
Branch: main (or your default branch)
Root Directory: (leave empty)
Build Command: npm install && npm run build
Start Command: npm start
```

### 2.3 Set Environment Variables
In the "Environment" section, add these variables:
```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
LOG_LEVEL=info
RATE_LIMIT_EMAIL_REQUESTS=10
RATE_LIMIT_STATUS_REQUESTS=60
RATE_LIMIT_MONITORING_REQUESTS=120
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (something like: `https://resilient-email-service-xyz.onrender.com`)

## Step 3: Deploy Frontend to Netlify

### 3.1 Create New Site
1. Go to your Netlify dashboard
2. Click "New site from Git"
3. Choose GitHub and authorize
4. Select your repository

### 3.2 Configure Build Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/build
```

### 3.3 Set Environment Variables
In "Site settings" → "Environment variables", add:
```
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
REACT_APP_APP_NAME=Resilient Email Service
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_LOGS=true
REACT_APP_ENABLE_METRICS=true
REACT_APP_REFRESH_INTERVAL=2000
```

**Important**: Replace `your-backend-url.onrender.com` with your actual Render.com URL from Step 2.4

### 3.4 Deploy
1. Click "Deploy site"
2. Wait for deployment to complete
3. Note your frontend URL (something like: `https://amazing-site-name.netlify.app`)

## Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
1. Go back to your Render.com service
2. Update the `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://your-netlify-site.netlify.app
```
3. Replace `your-netlify-site.netlify.app` with your actual Netlify URL

### 4.2 Trigger Redeploy
1. In Render.com, click "Manual Deploy" → "Deploy latest commit"
2. Wait for redeployment

## Step 5: Test Your Deployment

1. Visit your Netlify frontend URL
2. You should see the Email Service Dashboard
3. Test sending an email through the form
4. Check that all dashboard components load correctly

## Step 6: Set Up Custom Domains (Optional)

### For Render.com:
1. Go to your service settings
2. Add custom domain
3. Update DNS records as instructed

### For Netlify:
1. Go to "Domain settings"
2. Add custom domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGIN` is set correctly in Render.com
2. **API Not Found**: Verify `REACT_APP_API_BASE_URL` in Netlify
3. **Build Failures**: Check build logs in both platforms
4. **Environment Variables**: Ensure all required variables are set

### Health Check URLs:
- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-frontend.netlify.app`

## Production Considerations

1. **Database**: Consider adding a real database for production
2. **Email Providers**: Replace mock providers with real ones (SendGrid, Mailgun, etc.)
3. **Logging**: Consider using external logging services
4. **Monitoring**: Set up monitoring and alerting
5. **Security**: Add authentication and authorization as needed

## Cost Optimization

- **Render.com**: Free tier includes 750 hours/month
- **Netlify**: Free tier includes 100GB bandwidth/month
- Both services may spin down during inactivity (free tier)

## Next Steps

After successful deployment:
1. Monitor your applications
2. Set up domain names
3. Configure real email providers
4. Add authentication if needed
5. Set up monitoring and logging
