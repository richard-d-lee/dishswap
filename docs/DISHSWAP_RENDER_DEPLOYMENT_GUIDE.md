# DishSwap Render Deployment Guide

Complete guide for deploying the DishSwap application to production using Render hosting platform.

---

## Overview

This guide walks you through deploying the DishSwap web application to Render, a modern cloud platform that simplifies application deployment. Render provides automatic deployments from GitHub, managed databases, SSL certificates, and scalable infrastructure. The deployment process involves setting up a web service for the combined frontend and backend, configuring a MySQL database, and setting environment variables for all external services.

**What You'll Deploy:**
- Combined web service (React frontend + Express backend)
- MySQL database with automatic backups
- SSL certificate for HTTPS
- Custom domain (optional)

**Estimated Time:** 30-45 minutes

**Prerequisites:**
- GitHub account with DishSwap repository
- Render account (free tier available)
- All external API credentials configured (see External API Setup Guide)

**Repository:** [https://github.com/richard-d-lee/dishswap](https://github.com/richard-d-lee/dishswap)

---

## Part 1: Render Account Setup

### Step 1: Create Render Account

Navigate to [render.com](https://render.com) and click "Get Started" to create a free account. Render offers a free tier that includes 750 hours of web service runtime per month and a PostgreSQL database. While DishSwap uses MySQL, you can use a third-party MySQL provider like PlanetScale or upgrade to Render's paid tier for MySQL support.

Sign up using your GitHub account for seamless integration. This allows Render to automatically deploy from your repositories without additional authentication steps.

### Step 2: Connect GitHub Repository

After signing in, navigate to the Dashboard and click "New +" in the top right corner. Select "Web Service" from the dropdown menu. Render will prompt you to connect your GitHub account if you haven't already done so.

Grant Render access to your repositories. You can choose to give access to all repositories or select specific ones. For security purposes, it's recommended to only grant access to the dishswap repository.

---

## Part 2: Database Setup

Before deploying the web service, you need to set up a MySQL database. Render's free tier includes PostgreSQL but not MySQL. You have two options for MySQL hosting.

### Option A: PlanetScale (Recommended)

PlanetScale offers a generous free tier with 5GB storage and 1 billion row reads per month, which is more than sufficient for a production DishSwap deployment.

**Step 1: Create PlanetScale Account**

Visit [planetscale.com](https://planetscale.com) and sign up for a free account. You can use your GitHub account for quick registration.

**Step 2: Create Database**

1. Click "Create a database" from the dashboard
2. Name it "dishswap-production"
3. Select a region close to your Render deployment (e.g., US East if deploying to Render's US East region)
4. Click "Create database"

**Step 3: Get Connection String**

1. Navigate to your database dashboard
2. Click "Connect" button
3. Select "General" connection type
4. Copy the connection string, which looks like:
   ```
   mysql://username:password@host.us-east-3.psdb.cloud/dishswap-production?ssl={"rejectUnauthorized":true}
   ```

**Step 4: Enable Production Mode**

PlanetScale databases start in development mode, which allows direct schema changes. For production, you should enable production mode:

1. Go to Settings → General
2. Click "Enable production mode"
3. Confirm the action

In production mode, schema changes must go through the branch and deploy request workflow, which provides safety and rollback capabilities.

### Option B: Render MySQL (Paid)

If you prefer to keep everything on Render, you can upgrade to a paid plan that includes MySQL support.

**Step 1: Create MySQL Database**

1. From Render Dashboard, click "New +" → "MySQL"
2. Name it "dishswap-db"
3. Select a region (same as your web service for best performance)
4. Choose an instance type (Starter plan is $7/month)
5. Click "Create Database"

**Step 2: Wait for Provisioning**

Database provisioning typically takes 2-3 minutes. Once complete, you'll see a green "Available" status.

**Step 3: Get Connection Details**

Navigate to the database dashboard and copy the "Internal Database URL". This is optimized for connections from other Render services in the same region.

---

## Part 3: Web Service Deployment

Now that the database is ready, you can deploy the web application.

### Step 1: Create Web Service

1. From Render Dashboard, click "New +" → "Web Service"
2. Select "Build and deploy from a Git repository"
3. Click "Connect" next to your dishswap repository
4. If the repository isn't listed, click "Configure account" to grant access

### Step 2: Configure Service Settings

Fill in the service configuration form with the following settings:

| Setting | Value | Notes |
|---------|-------|-------|
| Name | dishswap-web | Used in the default URL |
| Region | Oregon (US West) | Choose closest to your users |
| Branch | main | Auto-deploys on push to this branch |
| Root Directory | (leave blank) | App is at repository root |
| Runtime | Node | Automatically detected |
| Build Command | `pnpm install && pnpm build` | Installs deps and builds app |
| Start Command | `pnpm start` | Starts production server |
| Instance Type | Free | Upgrade to Starter ($7/mo) for better performance |

### Step 3: Add Environment Variables

Scroll down to the "Environment Variables" section and click "Add Environment Variable". You need to add all the variables from your local `.env` file. Here's the complete list:

**Database Configuration:**
```
DATABASE_URL = [Your PlanetScale or Render MySQL connection string]
```

**JWT Configuration:**
```
JWT_SECRET = [Generate with: openssl rand -base64 32]
```

**Server Configuration:**
```
NODE_ENV = production
PORT = 3000
```

**AWS S3 Configuration:**
```
AWS_ACCESS_KEY_ID = [From AWS IAM]
AWS_SECRET_ACCESS_KEY = [From AWS IAM]
AWS_REGION = us-east-1
AWS_S3_BUCKET = dishswap-uploads
```

**Email Configuration:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [Your email address]
SMTP_PASSWORD = [App-specific password]
SMTP_FROM = noreply@dishswap.com
```

**Google OAuth Configuration:**
```
GOOGLE_CLIENT_ID = [From Google Cloud Console]
GOOGLE_CLIENT_SECRET = [From Google Cloud Console]
GOOGLE_WEB_CLIENT_ID = [From Google Cloud Console]
```

**Facebook OAuth Configuration:**
```
FACEBOOK_APP_ID = [From Facebook Developers]
FACEBOOK_APP_SECRET = [From Facebook Developers]
```

**OpenAI Configuration:**
```
OPENAI_API_KEY = [From OpenAI Platform]
```

**Google Maps Configuration:**
```
GOOGLE_MAPS_API_KEY = [From Google Cloud Console]
```

**Sentry Configuration:**
```
SENTRY_DSN = [From Sentry Project Settings]
VITE_SENTRY_DSN = [From Sentry Project Settings]
```

**Important Notes:**

- Click "Add Environment Variable" for each variable
- Values are encrypted at rest
- Changes to environment variables trigger a new deployment
- Never commit these values to Git

### Step 4: Deploy

Click "Create Web Service" at the bottom of the page. Render will begin building and deploying your application. The initial deployment takes 5-10 minutes and includes these steps:

1. **Cloning Repository**: Render clones your GitHub repository
2. **Installing Dependencies**: Runs `pnpm install` to download all packages
3. **Building Application**: Runs `pnpm build` to compile TypeScript and bundle frontend
4. **Starting Server**: Runs `pnpm start` to launch the production server
5. **Health Checks**: Verifies the server responds to HTTP requests

You can monitor the deployment progress in the "Logs" tab. Look for these key messages:

```
==> Cloning from https://github.com/richard-d-lee/dishswap...
==> Running build command 'pnpm install && pnpm build'...
==> Build successful!
==> Starting service with 'pnpm start'...
==> Server running on http://localhost:3000/
==> Your service is live 🎉
```

### Step 5: Initialize Database Schema

Once the deployment is complete, you need to initialize the database schema. Render doesn't automatically run migrations, so you'll need to do this manually.

**Option 1: Using Render Shell (Recommended)**

1. Navigate to your web service dashboard
2. Click "Shell" in the top menu
3. Run the migration command:
   ```bash
   pnpm db:push
   ```
4. Wait for the schema to be created (takes about 30 seconds)
5. Type `exit` to close the shell

**Option 2: Using Local Machine**

If you prefer, you can run migrations from your local machine by temporarily setting the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="your-production-database-url"
pnpm db:push
```

**Important:** Be careful when running migrations from your local machine. Always verify you're connected to the correct database.

---

## Part 4: Verify Deployment

After deployment completes, verify that everything is working correctly.

### Step 1: Access Your Application

Your application is now live at the Render-provided URL, which follows the format:

```
https://dishswap-web.onrender.com
```

You can find the exact URL in the service dashboard at the top of the page. Click the URL to open your application in a new tab.

### Step 2: Test Core Functionality

Perform these tests to ensure the deployment was successful:

**1. Homepage Loads**
- Navigate to your application URL
- Verify the homepage displays correctly
- Check that images and styles load properly

**2. User Registration**
- Click "Sign Up" or "Get Started"
- Create a new account with email and password
- Verify you receive the verification email
- Click the verification link in the email
- Confirm your account is activated

**3. User Login**
- Log in with your newly created account
- Verify you're redirected to the dashboard
- Check that your profile information displays correctly

**4. OAuth Login (if configured)**
- Log out and return to the login page
- Click "Continue with Google"
- Complete the Google OAuth flow
- Verify you're logged in and redirected to the dashboard

**5. Profile Setup**
- Navigate to Profile Settings
- Upload a profile photo
- Fill in your bio and preferences
- Save changes
- Verify the photo appears in your profile

**6. Session Creation (Host)**
- If you're a host, create a new meal session
- Fill in all required fields
- Upload a photo of the meal
- Publish the session
- Verify it appears in the browse sessions page

**7. Database Connectivity**
- Any successful login or registration confirms database connectivity
- Check the Render logs for any database connection errors

### Step 3: Monitor Logs

Keep the Render logs open in a separate tab for the first few hours after deployment. Watch for:

- **Error messages**: Look for stack traces or error logs
- **Performance issues**: Slow response times or timeouts
- **Database errors**: Connection failures or query errors
- **External API errors**: Failed calls to S3, email service, or OAuth providers

Common issues and solutions are covered in Part 6 of this guide.

---

## Part 5: Custom Domain Setup (Optional)

By default, your application is accessible at `dishswap-web.onrender.com`. For a professional appearance, you can configure a custom domain like `dishswap.com`.

### Step 1: Purchase Domain

Purchase a domain from a domain registrar such as:

- **Namecheap**: [namecheap.com](https://www.namecheap.com) - Budget-friendly, good UI
- **Google Domains**: [domains.google](https://domains.google) - Simple integration with Google services
- **Cloudflare**: [cloudflare.com](https://www.cloudflare.com) - Includes free CDN and DDoS protection
- **GoDaddy**: [godaddy.com](https://www.godaddy.com) - Popular but more expensive

Expect to pay $10-15 per year for a `.com` domain.

### Step 2: Add Custom Domain in Render

1. Navigate to your web service dashboard in Render
2. Click "Settings" in the left sidebar
3. Scroll down to "Custom Domains"
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `dishswap.com` or `www.dishswap.com`)
6. Click "Save"

Render will provide you with DNS records to configure.

### Step 3: Configure DNS Records

Log in to your domain registrar's dashboard and add the DNS records provided by Render. The exact process varies by registrar, but generally involves:

1. Navigate to DNS Management or DNS Settings
2. Add a new CNAME record:
   - **Name/Host**: `www` (or `@` for root domain)
   - **Value/Target**: `dishswap-web.onrender.com`
   - **TTL**: 3600 (or automatic)
3. Save the record

**For Root Domain (dishswap.com without www):**

Some registrars don't support CNAME records for root domains. In this case, you have two options:

**Option A: Use ALIAS or ANAME Record**

If your registrar supports ALIAS or ANAME records (Cloudflare, DNSimple, DNS Made Easy):
- **Name/Host**: `@`
- **Value/Target**: `dishswap-web.onrender.com`

**Option B: Use A Record**

If your registrar only supports A records:
1. In Render, Render will provide an IP address
2. Create an A record:
   - **Name/Host**: `@`
   - **Value/Target**: [IP address from Render]

### Step 4: Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally, though it's usually complete within 1-2 hours. You can check the status using online tools:

- [whatsmydns.net](https://www.whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

Enter your domain and check if the CNAME or A record points to Render's servers.

### Step 5: Enable SSL Certificate

Once DNS propagation is complete, Render automatically provisions a free SSL certificate from Let's Encrypt. This process is automatic and typically completes within 5-10 minutes of DNS propagation.

You'll see the status change from "Certificate Pending" to "Certificate Active" in the Render dashboard. Once active, your site will be accessible via HTTPS at your custom domain.

### Step 6: Update OAuth Redirect URIs

After configuring your custom domain, you must update the OAuth redirect URIs in Google Cloud Console and Facebook Developers portal:

**Google Cloud Console:**
1. Navigate to APIs & Services → Credentials
2. Click on your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
4. Click "Save"

**Facebook Developers:**
1. Navigate to your app dashboard
2. Go to Settings → Basic
3. Add to "App Domains":
   ```
   yourdomain.com
   ```
4. Go to Facebook Login → Settings
5. Add to "Valid OAuth Redirect URIs":
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```
6. Click "Save Changes"

### Step 7: Update Environment Variables

Update any environment variables that reference your domain:

```
SMTP_FROM = noreply@yourdomain.com
```

This change will trigger a new deployment.

---

## Part 6: Post-Deployment Configuration

After successful deployment, there are several additional configurations to optimize your production environment.

### Step 1: Configure Auto-Deploy

Render can automatically deploy your application whenever you push changes to GitHub. This is already enabled by default if you connected via GitHub, but you can customize the behavior:

1. Navigate to Settings → Build & Deploy
2. Under "Auto-Deploy", select:
   - **Yes**: Deploy on every push to the branch (recommended for production)
   - **No**: Manual deploys only (useful for staging environments)
3. Under "Branch", ensure it's set to `main` or your production branch

### Step 2: Set Up Health Checks

Health checks ensure Render can detect if your application becomes unresponsive and automatically restart it.

1. Navigate to Settings → Health & Alerts
2. Configure health check settings:
   - **Health Check Path**: `/api/trpc/auth.me` (or any endpoint that returns 200 OK)
   - **Health Check Interval**: 30 seconds
   - **Timeout**: 10 seconds
   - **Unhealthy Threshold**: 3 consecutive failures
3. Click "Save Changes"

### Step 3: Configure Notifications

Set up notifications to alert you when deployments fail or the service goes down:

1. Navigate to Settings → Notifications
2. Click "Add Notification"
3. Select notification type:
   - **Email**: Sends to your Render account email
   - **Slack**: Integrates with your Slack workspace
   - **Discord**: Sends to a Discord webhook
4. Choose events to notify:
   - Deploy succeeded
   - Deploy failed
   - Service suspended
   - Service resumed
5. Click "Save"

### Step 4: Enable Persistent Disk (Optional)

By default, Render's file system is ephemeral, meaning files are lost when the service restarts. Since DishSwap stores photos in S3, you don't need persistent storage. However, if you want to cache files locally for performance, you can add a persistent disk:

1. Navigate to Settings → Disks
2. Click "Add Disk"
3. Configure:
   - **Name**: cache
   - **Mount Path**: `/app/cache`
   - **Size**: 1 GB (free tier includes 1 GB)
4. Click "Save"

Update your application to use `/app/cache` for temporary file storage.

### Step 5: Configure Scaling (Paid Plans)

If you're on a paid plan, you can configure auto-scaling to handle traffic spikes:

1. Navigate to Settings → Scaling
2. Configure:
   - **Min Instances**: 1 (always keep at least one running)
   - **Max Instances**: 3 (scale up to three instances under load)
   - **CPU Threshold**: 70% (scale up when CPU exceeds 70%)
   - **Memory Threshold**: 80% (scale up when memory exceeds 80%)
3. Click "Save Changes"

Free tier is limited to a single instance and doesn't support auto-scaling.

---

## Part 7: Monitoring and Maintenance

### Step 1: Monitor Application Performance

Render provides built-in metrics for monitoring your application:

1. Navigate to the "Metrics" tab in your service dashboard
2. Monitor these key metrics:
   - **CPU Usage**: Should stay below 80% under normal load
   - **Memory Usage**: Should stay below 80% of allocated memory
   - **Request Rate**: Number of requests per minute
   - **Response Time**: Average response time (should be under 500ms)
   - **Error Rate**: Percentage of requests that return errors

Set up alerts if any metric exceeds acceptable thresholds.

### Step 2: Review Application Logs

Regularly review application logs to identify issues:

1. Navigate to the "Logs" tab
2. Look for:
   - Error stack traces
   - Slow database queries
   - Failed external API calls
   - Authentication failures
3. Use the search box to filter logs by keyword
4. Click "Download Logs" to save for analysis

### Step 3: Monitor Sentry for Errors

If you configured Sentry, use it for detailed error tracking:

1. Log in to [sentry.io](https://sentry.io)
2. Navigate to your DishSwap project
3. Review the Issues page for:
   - New errors that appeared after deployment
   - High-frequency errors affecting many users
   - Performance issues and slow transactions
4. Click on individual issues to see:
   - Stack traces
   - User context (browser, OS, user ID)
   - Breadcrumbs (events leading up to the error)

### Step 4: Database Maintenance

**For PlanetScale:**

1. Monitor database insights in the PlanetScale dashboard:
   - Query performance
   - Slow queries
   - Storage usage
2. Set up automated backups (included in free tier)
3. Review and optimize slow queries

**For Render MySQL:**

1. Navigate to your database dashboard
2. Monitor:
   - Connection count
   - Storage usage
   - Query performance
3. Configure automated backups:
   - Go to Settings → Backups
   - Enable daily backups
   - Set retention period (7 days recommended)

### Step 5: Update Dependencies

Regularly update npm packages to patch security vulnerabilities:

```bash
# Check for outdated packages
pnpm outdated

# Update all packages to latest compatible versions
pnpm update

# Update to latest versions (may include breaking changes)
pnpm update --latest

# Commit and push changes
git add package.json pnpm-lock.yaml
git commit -m "Update dependencies"
git push
```

Render will automatically deploy the updated application.

---

## Part 8: Common Issues and Solutions

### Issue: Build Fails with "Out of Memory"

**Symptom:** Build fails with error "JavaScript heap out of memory"

**Cause:** The free tier has limited memory (512 MB), and building large applications can exceed this limit.

**Solutions:**

1. **Increase Node.js memory limit** by modifying the build command:
   ```
   NODE_OPTIONS="--max-old-space-size=2048" pnpm install && pnpm build
   ```

2. **Upgrade to Starter plan** ($7/month) which provides 2 GB memory

3. **Optimize build process** by reducing bundle size:
   - Remove unused dependencies
   - Use dynamic imports for large components
   - Enable tree shaking in Vite config

### Issue: Database Connection Timeout

**Symptom:** Application logs show "Connection timeout" or "Too many connections"

**Cause:** Database connection pool exhausted or network issues

**Solutions:**

1. **Check DATABASE_URL** is correct in environment variables

2. **Verify database is running** in PlanetScale or Render dashboard

3. **Increase connection pool size** in `server/db.ts`:
   ```typescript
   export const db = drizzle(mysql2.createPool({
     uri: process.env.DATABASE_URL,
     connectionLimit: 10, // Increase from default 5
   }));
   ```

4. **Check for connection leaks** - ensure all queries properly close connections

### Issue: OAuth Redirect Fails

**Symptom:** After clicking "Sign in with Google/Facebook", user sees error or blank page

**Cause:** Incorrect redirect URI configuration

**Solutions:**

1. **Verify redirect URIs** in Google/Facebook console match your Render URL exactly:
   ```
   https://dishswap-web.onrender.com/api/auth/google/callback
   ```

2. **Check environment variables** `GOOGLE_CLIENT_ID` and `FACEBOOK_APP_ID` are correct

3. **Enable OAuth consent screen** in Google Cloud Console

4. **Add test users** in Facebook app settings if app is in development mode

### Issue: Email Verification Not Sending

**Symptom:** Users don't receive verification emails

**Cause:** SMTP configuration incorrect or email provider blocking

**Solutions:**

1. **Verify SMTP credentials** in environment variables

2. **Check spam folder** - verification emails may be marked as spam

3. **Enable "Less secure app access"** for Gmail (or use app-specific password)

4. **Check email provider limits** - Gmail has daily sending limits

5. **Test SMTP connection** using Render shell:
   ```bash
   node -e "require('./server/email').sendVerificationEmail('test@example.com', 'token')"
   ```

### Issue: Photos Not Uploading

**Symptom:** Photo upload fails with error or shows loading indefinitely

**Cause:** S3 configuration incorrect or CORS policy blocking uploads

**Solutions:**

1. **Verify AWS credentials** in environment variables

2. **Check S3 bucket permissions** - ensure IAM user has `PutObject` permission

3. **Configure CORS policy** on S3 bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://dishswap-web.onrender.com"],
       "ExposeHeaders": []
     }
   ]
   ```

4. **Check file size limits** - default is 5 MB in `server/index.ts`

### Issue: Service Sleeps After Inactivity

**Symptom:** First request after inactivity takes 30+ seconds to respond

**Cause:** Render's free tier spins down services after 15 minutes of inactivity

**Solutions:**

1. **Upgrade to Starter plan** ($7/month) which keeps services always running

2. **Set up uptime monitoring** to ping your service every 10 minutes:
   - Use [UptimeRobot](https://uptimerobot.com) (free)
   - Configure HTTP monitor to ping `https://dishswap-web.onrender.com` every 5 minutes

3. **Accept the limitation** - free tier is suitable for development and low-traffic apps

### Issue: High Response Times

**Symptom:** Pages load slowly, API requests take several seconds

**Cause:** Various performance issues

**Solutions:**

1. **Enable caching** for static assets in `server/index.ts`:
   ```typescript
   app.use(express.static('dist/client', {
     maxAge: '1y',
     etag: false,
   }));
   ```

2. **Optimize database queries** - add indexes for frequently queried columns:
   ```sql
   CREATE INDEX idx_sessions_date ON sessions(date);
   CREATE INDEX idx_users_email ON users(email);
   ```

3. **Enable compression** in `server/index.ts`:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

4. **Use CDN for images** - S3 URLs can be served through CloudFront

5. **Upgrade instance type** to get more CPU and memory

---

## Part 9: Rollback and Recovery

### Rolling Back to Previous Deployment

If a deployment introduces bugs or breaks functionality, you can quickly rollback to a previous version:

1. Navigate to the "Events" tab in your service dashboard
2. Find the last successful deployment before the problematic one
3. Click the three dots (⋯) next to that deployment
4. Select "Redeploy"
5. Confirm the action

Render will redeploy the application using the code and environment variables from that deployment. This typically takes 2-3 minutes.

### Manual Rollback via Git

Alternatively, you can rollback by reverting the Git commit:

```bash
# Find the commit to revert to
git log --oneline

# Revert to that commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

### Database Recovery

**For PlanetScale:**

1. Navigate to your database dashboard
2. Click "Backups" in the left sidebar
3. Select the backup to restore
4. Click "Restore backup"
5. Choose whether to restore to the same database or create a new one

**For Render MySQL:**

1. Navigate to your database dashboard
2. Click "Backups" in the left sidebar
3. Click "Restore" next to the desired backup
4. Confirm the restoration

**Important:** Database restoration overwrites all current data. Always create a backup before restoring.

---

## Part 10: Cost Optimization

### Free Tier Limitations

Render's free tier includes:
- 750 hours of web service runtime per month (enough for one always-on service)
- 512 MB RAM
- Shared CPU
- Service spins down after 15 minutes of inactivity
- 100 GB bandwidth per month

### Upgrading to Paid Plans

Consider upgrading when:
- You need the service to stay always-on (no spin-down)
- You need more than 512 MB RAM
- You need better performance (dedicated CPU)
- You need auto-scaling capabilities

**Starter Plan ($7/month per service):**
- 512 MB RAM
- Always-on (no spin-down)
- Shared CPU
- 100 GB bandwidth

**Standard Plan ($25/month per service):**
- 2 GB RAM
- Always-on
- Dedicated CPU
- 100 GB bandwidth
- Auto-scaling

### Cost Optimization Tips

1. **Use PlanetScale free tier** instead of Render MySQL to save $7/month

2. **Optimize images** before uploading to S3 to reduce storage and bandwidth costs

3. **Enable caching** to reduce server load and bandwidth usage

4. **Use CloudFront CDN** for S3 assets to reduce S3 bandwidth costs

5. **Monitor usage** regularly to avoid unexpected charges

6. **Set up billing alerts** in Render to get notified when approaching limits

---

## Part 11: Security Best Practices

### Environment Variables

- **Never commit** `.env` files to Git
- **Rotate secrets** regularly (every 90 days)
- **Use strong JWT secrets** (at least 32 characters)
- **Limit AWS IAM permissions** to only what's needed

### HTTPS

- Always use HTTPS in production (Render provides this automatically)
- Set secure cookie flags in `server/auth/jwt.ts`:
  ```typescript
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  ```

### Rate Limiting

Rate limiting is already configured in `server/index.ts`. Monitor for abuse and adjust limits as needed:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
```

### Database Security

- **Use parameterized queries** (Drizzle ORM does this automatically)
- **Limit database user permissions** to only necessary operations
- **Enable SSL** for database connections
- **Regular backups** (daily recommended)

### Dependency Security

Run security audits regularly:

```bash
pnpm audit

# Fix vulnerabilities automatically
pnpm audit --fix
```

Subscribe to GitHub security alerts for your repository to get notified of vulnerabilities.

---

## Part 12: Next Steps

### Monitoring and Analytics

Set up comprehensive monitoring:

1. **Sentry** for error tracking (already configured)
2. **Google Analytics** for user behavior tracking
3. **LogRocket** for session replay and debugging
4. **UptimeRobot** for uptime monitoring

### Performance Optimization

1. **Enable Redis caching** for frequently accessed data
2. **Implement CDN** for static assets
3. **Optimize images** with automatic compression
4. **Add database indexes** for slow queries

### Feature Enhancements

1. **Push notifications** using Firebase Cloud Messaging
2. **Email notifications** for new messages and session updates
3. **Advanced search** with Elasticsearch or Algolia
4. **Payment processing** with Stripe (if monetizing)

### Scaling Considerations

As your user base grows, consider:

1. **Horizontal scaling** with multiple Render instances
2. **Database read replicas** for better performance
3. **Microservices architecture** for independent scaling
4. **Message queue** (Redis/RabbitMQ) for background jobs

---

## Support and Resources

If you encounter issues not covered in this guide, consult these resources:

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Community Forum**: [community.render.com](https://community.render.com)
- **DishSwap GitHub Issues**: [github.com/richard-d-lee/dishswap/issues](https://github.com/richard-d-lee/dishswap/issues)
- **Render Status Page**: [status.render.com](https://status.render.com)

For urgent issues, contact Render support through the dashboard (available on paid plans) or the community forum (free tier).

---

## Deployment Checklist

Use this checklist to ensure you've completed all deployment steps:

- [ ] Created Render account and connected GitHub
- [ ] Set up MySQL database (PlanetScale or Render)
- [ ] Created web service and configured build/start commands
- [ ] Added all environment variables
- [ ] Deployed application successfully
- [ ] Initialized database schema with `pnpm db:push`
- [ ] Verified homepage loads correctly
- [ ] Tested user registration and email verification
- [ ] Tested user login with email/password
- [ ] Tested OAuth login (Google and Facebook)
- [ ] Tested profile photo upload
- [ ] Tested session creation and browsing
- [ ] Configured custom domain (if applicable)
- [ ] Updated OAuth redirect URIs for custom domain
- [ ] Set up health checks and notifications
- [ ] Configured Sentry for error tracking
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Reviewed application logs for errors
- [ ] Tested on mobile devices
- [ ] Created database backup
- [ ] Documented deployment process for team

Congratulations! Your DishSwap application is now live in production.
