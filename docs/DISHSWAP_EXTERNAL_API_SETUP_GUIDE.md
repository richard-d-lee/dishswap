# DishSwap External API Configuration Guide

Complete guide for configuring all external services required by the DishSwap application.

---

## Overview

DishSwap integrates with several external services to provide features like photo storage, email notifications, social authentication, location services, AI capabilities, and error tracking. This guide provides step-by-step instructions for setting up each service and obtaining the necessary API credentials.

**Required Services:**
- AWS S3 (photo storage)
- SMTP Email Service (verification and password reset emails)
- Google Cloud Platform (OAuth and Maps API)
- Facebook Developers (OAuth)
- Sentry (error tracking)

**Optional Services:**
- OpenAI (AI features)

**Estimated Time:** 60-90 minutes for all services

---

## Part 1: AWS S3 Configuration

AWS S3 (Simple Storage Service) is used to store user profile photos and session photos. This section guides you through creating an S3 bucket, configuring permissions, and obtaining access credentials.

### Step 1: Create AWS Account

Navigate to [aws.amazon.com](https://aws.amazon.com) and click "Create an AWS Account". You'll need to provide:

- Email address
- Password
- AWS account name (e.g., "DishSwap Production")
- Contact information
- Payment method (credit card)

AWS offers a generous free tier that includes 5 GB of S3 storage and 20,000 GET requests per month, which is sufficient for development and early production use.

### Step 2: Create S3 Bucket

After signing in to the AWS Console:

1. Navigate to the S3 service by searching for "S3" in the top search bar
2. Click "Create bucket"
3. Configure bucket settings:

| Setting | Value | Notes |
|---------|-------|-------|
| Bucket name | `dishswap-uploads` | Must be globally unique; add suffix if taken |
| AWS Region | `us-east-1` | Choose closest to your users |
| Object Ownership | ACLs disabled | Recommended for security |
| Block Public Access | Uncheck "Block all public access" | Required for public photo access |
| Bucket Versioning | Disabled | Optional; enable for file history |
| Default encryption | SSE-S3 | Encrypts files at rest |

4. Acknowledge the warning about public access (we'll configure specific permissions later)
5. Click "Create bucket"

### Step 3: Configure CORS Policy

CORS (Cross-Origin Resource Sharing) allows your web application to upload files directly to S3 from the browser.

1. Click on your newly created bucket
2. Navigate to the "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://dishswap-web.onrender.com",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Replace `https://yourdomain.com` with your actual production domain
7. Click "Save changes"

### Step 4: Create IAM User

IAM (Identity and Access Management) users provide programmatic access to AWS services. Create a dedicated user for DishSwap:

1. Navigate to IAM by searching for "IAM" in the top search bar
2. Click "Users" in the left sidebar
3. Click "Add users"
4. Configure user:
   - **User name**: `dishswap-uploader`
   - **Access type**: Select "Access key - Programmatic access"
5. Click "Next: Permissions"

### Step 5: Set IAM Permissions

1. Select "Attach existing policies directly"
2. Click "Create policy"
3. In the new tab that opens, click the "JSON" tab
4. Paste the following policy (replace `dishswap-uploads` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dishswap-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::dishswap-uploads"
    }
  ]
}
```

5. Click "Next: Tags" (skip tags)
6. Click "Next: Review"
7. Name the policy: `DishSwapS3UploadPolicy`
8. Click "Create policy"
9. Return to the previous tab and click the refresh button
10. Search for `DishSwapS3UploadPolicy` and select it
11. Click "Next: Tags" (skip tags)
12. Click "Next: Review"
13. Click "Create user"

### Step 6: Save Access Credentials

After creating the user, AWS displays the access credentials. **This is the only time you'll see the secret access key**, so save it immediately.

1. Copy the "Access key ID" (looks like `AKIAIOSFODNN7EXAMPLE`)
2. Copy the "Secret access key" (looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
3. Click "Download .csv" to save a backup
4. Store these credentials securely (password manager recommended)

### Step 7: Add to Environment Variables

Add the following to your `.env` file:

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=dishswap-uploads
```

### Step 8: Test S3 Upload

Test the S3 configuration by uploading a profile photo:

1. Start your development server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. Register a new account and log in
4. Go to Profile Settings
5. Click "Upload Photo" and select an image
6. Click "Save"
7. Verify the photo appears in your profile

If the upload fails, check the browser console and server logs for error messages.

---

## Part 2: Email Service Configuration

Email service is required for sending account verification emails and password reset links. You have three options: Gmail SMTP (easiest for development), SendGrid (recommended for production), or AWS SES (best for high volume).

### Option A: Gmail SMTP (Development)

Gmail SMTP is the easiest option for development and low-volume production use (up to 500 emails per day).

**Step 1: Enable 2-Factor Authentication**

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the prompts to enable 2FA using your phone

**Step 2: Generate App Password**

1. Return to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "App passwords"
3. If you don't see this option, ensure 2FA is enabled
4. Select app: "Mail"
5. Select device: "Other" and enter "DishSwap"
6. Click "Generate"
7. Copy the 16-character password (looks like `abcd efgh ijkl mnop`)

**Step 3: Add to Environment Variables**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM=noreply@dishswap.com
```

**Important Notes:**
- Remove spaces from the app password when pasting into `.env`
- Gmail has a sending limit of 500 emails per day
- For production, consider using a dedicated email service

### Option B: SendGrid (Production Recommended)

SendGrid is a professional email service with a generous free tier (100 emails per day) and excellent deliverability.

**Step 1: Create SendGrid Account**

1. Navigate to [sendgrid.com](https://sendgrid.com)
2. Click "Start for free"
3. Fill in registration form
4. Verify your email address

**Step 2: Create API Key**

1. Log in to SendGrid dashboard
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Configure:
   - **Name**: DishSwap Production
   - **Permissions**: Full Access (or Restricted Access with Mail Send only)
5. Click "Create & View"
6. Copy the API key (starts with `SG.`)
7. Store securely (you won't see it again)

**Step 3: Verify Sender Identity**

SendGrid requires sender verification to prevent spam:

1. Navigate to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in the form:
   - **From Name**: DishSwap
   - **From Email**: noreply@yourdomain.com (or your email)
   - **Reply To**: support@yourdomain.com
   - **Company Address**: Your address
4. Click "Create"
5. Check your email and click the verification link

**Step 4: Add to Environment Variables**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM=noreply@yourdomain.com
```

**Note:** The username is literally the string "apikey", not your SendGrid username.

### Option C: AWS SES (High Volume)

AWS SES (Simple Email Service) is cost-effective for high-volume email sending ($0.10 per 1,000 emails).

**Step 1: Set Up AWS SES**

1. Navigate to SES in AWS Console
2. Click "Verify a New Email Address"
3. Enter your email and click "Verify This Email Address"
4. Check your email and click the verification link

**Step 2: Request Production Access**

By default, SES is in sandbox mode (limited to verified addresses). To send to any address:

1. In SES console, click "Sending Statistics"
2. Click "Request Production Access"
3. Fill in the form explaining your use case
4. Submit the request (typically approved within 24 hours)

**Step 3: Create SMTP Credentials**

1. In SES console, navigate to "SMTP Settings"
2. Click "Create My SMTP Credentials"
3. Enter IAM username: `dishswap-ses-smtp`
4. Click "Create"
5. Download the credentials CSV

**Step 4: Add to Environment Variables**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

### Testing Email Configuration

Test email sending by registering a new account:

1. Start your development server
2. Register with a real email address
3. Check your inbox for the verification email
4. If email doesn't arrive within 5 minutes:
   - Check spam folder
   - Check server logs for errors
   - Verify SMTP credentials are correct
   - Ensure sender email is verified (SendGrid/SES)

---

## Part 3: Google Cloud Platform Configuration

Google Cloud Platform provides OAuth authentication and Maps API for location features.

### Step 1: Create Google Cloud Project

1. Navigate to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click "Select a project" dropdown at the top
4. Click "New Project"
5. Configure project:
   - **Project name**: DishSwap
   - **Organization**: (leave as "No organization")
6. Click "Create"
7. Wait for project creation (takes about 30 seconds)

### Step 2: Enable Required APIs

1. Ensure your new project is selected in the dropdown
2. Navigate to "APIs & Services" → "Library"
3. Search for and enable these APIs:
   - **Google+ API** (for OAuth)
   - **Google Maps JavaScript API** (for maps)
   - **Places API** (for location search)
   - **Geocoding API** (for address conversion)

For each API:
1. Click on the API name
2. Click "Enable"
3. Wait for activation

### Step 3: Configure OAuth Consent Screen

Before creating OAuth credentials, you must configure the consent screen that users see when logging in:

1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:

| Field | Value | Notes |
|-------|-------|-------|
| App name | DishSwap | Shown to users during login |
| User support email | your-email@gmail.com | For user questions |
| App logo | (optional) | 120x120 PNG recommended |
| Application home page | http://localhost:3000 | Your app URL |
| Authorized domains | localhost, yourdomain.com | Add production domain later |
| Developer contact | your-email@gmail.com | For Google to contact you |

5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click "Update" then "Save and Continue"
9. On "Test users" page, add your email for testing
10. Click "Save and Continue"
11. Review and click "Back to Dashboard"

### Step 4: Create OAuth Credentials for Web

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: DishSwap Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://dishswap-web.onrender.com
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/google/callback
     https://dishswap-web.onrender.com/api/auth/google/callback
     https://yourdomain.com/api/auth/google/callback
     ```
5. Click "Create"
6. Copy the "Client ID" (ends with `.apps.googleusercontent.com`)
7. Copy the "Client secret"
8. Click "OK"

### Step 5: Create OAuth Credentials for Mobile

Mobile apps require separate OAuth credentials:

1. Click "Create Credentials" → "OAuth client ID"
2. Select "iOS" (you'll create Android separately)
3. Configure:
   - **Name**: DishSwap iOS
   - **Bundle ID**: `com.dishswap.app` (must match your app.json)
4. Click "Create"
5. Copy the "Client ID"

Repeat for Android:
1. Click "Create Credentials" → "OAuth client ID"
2. Select "Android"
3. Configure:
   - **Name**: DishSwap Android
   - **Package name**: `com.dishswap.app`
   - **SHA-1 certificate fingerprint**: (see below)
4. Click "Create"

**Getting SHA-1 Fingerprint for Android:**

For development:
```bash
cd dishswap-mobile
keytool -keystore android/app/debug.keystore -list -v
```
Default password is `android`

For production, you'll need the SHA-1 from your release keystore.

### Step 6: Create Google Maps API Key

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the API key
4. Click "Restrict Key" (recommended for security)
5. Configure restrictions:
   - **Name**: DishSwap Maps Key
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**:
     ```
     http://localhost:3000/*
     https://dishswap-web.onrender.com/*
     https://yourdomain.com/*
     ```
   - **API restrictions**: Restrict key
   - **Select APIs**:
     - Maps JavaScript API
     - Places API
     - Geocoding API
6. Click "Save"

### Step 7: Add to Environment Variables

Add all Google credentials to your `.env` file:

```env
# Google OAuth (Web)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Google OAuth (Mobile - for mobile app .env)
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Step 8: Test Google OAuth

Test the OAuth integration:

1. Start your development server
2. Navigate to the login page
3. Click "Continue with Google"
4. Select your Google account
5. Grant permissions
6. Verify you're redirected back and logged in

If it fails:
- Check redirect URI matches exactly (including http vs https)
- Verify OAuth consent screen is configured
- Check that your email is added as a test user
- Review browser console and server logs for errors

---

## Part 4: Facebook Developers Configuration

Facebook OAuth allows users to log in with their Facebook accounts.

### Step 1: Create Facebook Developer Account

1. Navigate to [developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started"
3. Log in with your Facebook account
4. Complete the registration process
5. Verify your email address

### Step 2: Create Facebook App

1. From the Facebook Developers dashboard, click "My Apps"
2. Click "Create App"
3. Select "Consumer" as the app type
4. Click "Next"
5. Fill in app details:
   - **App name**: DishSwap
   - **App contact email**: your-email@gmail.com
   - **Business account**: (optional)
6. Click "Create App"
7. Complete the security check

### Step 3: Add Facebook Login Product

1. From your app dashboard, find "Facebook Login" in the products list
2. Click "Set Up"
3. Select "Web" as the platform
4. Enter your site URL: `http://localhost:3000`
5. Click "Save" and "Continue"
6. Skip the remaining steps (we'll configure manually)

### Step 4: Configure Facebook Login Settings

1. In the left sidebar, navigate to "Facebook Login" → "Settings"
2. Configure OAuth settings:

| Setting | Value |
|---------|-------|
| Client OAuth Login | Yes |
| Web OAuth Login | Yes |
| Force Web OAuth Reauthentication | No |
| Embedded Browser OAuth Login | Yes |
| Use Strict Mode for Redirect URIs | Yes |
| Valid OAuth Redirect URIs | `http://localhost:3000/api/auth/facebook/callback`<br>`https://dishswap-web.onrender.com/api/auth/facebook/callback`<br>`https://yourdomain.com/api/auth/facebook/callback` |

3. Click "Save Changes"

### Step 5: Configure Basic Settings

1. Navigate to "Settings" → "Basic" in the left sidebar
2. Note your "App ID" and "App Secret"
3. Add your domain:
   - **App Domains**: `localhost`, `dishswap-web.onrender.com`, `yourdomain.com`
4. Add Privacy Policy URL (required for production):
   - **Privacy Policy URL**: `https://yourdomain.com/privacy`
5. Add Terms of Service URL (optional):
   - **Terms of Service URL**: `https://yourdomain.com/terms`
6. Click "Save Changes"

### Step 6: Configure Mobile OAuth

For mobile apps, you need to add platform-specific settings:

**iOS Configuration:**
1. Scroll down to "Add Platform"
2. Select "iOS"
3. Configure:
   - **Bundle ID**: `com.dishswap.app`
   - **iPhone App Store ID**: (leave blank for development)
4. Click "Save Changes"

**Android Configuration:**
1. Click "Add Platform" again
2. Select "Android"
3. Configure:
   - **Google Play Package Name**: `com.dishswap.app`
   - **Class Name**: `com.dishswap.app.MainActivity`
   - **Key Hashes**: (see below)
4. Click "Save Changes"

**Getting Android Key Hash:**

For development:
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```
Default password is `android`

### Step 7: Add to Environment Variables

Add Facebook credentials to your `.env` file:

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Step 8: Test Facebook OAuth

Test the integration:

1. Start your development server
2. Navigate to the login page
3. Click "Continue with Facebook"
4. Log in with your Facebook account
5. Grant permissions
6. Verify you're redirected back and logged in

**Important:** Facebook apps start in "Development Mode", which means only you and added test users can log in. To allow public access:

1. Navigate to "Settings" → "Basic"
2. Ensure all required fields are filled (especially Privacy Policy URL)
3. Switch the toggle at the top from "In Development" to "Live"
4. Complete the App Review process if required

---

## Part 5: Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring for both backend and frontend.

### Step 1: Create Sentry Account

1. Navigate to [sentry.io](https://sentry.io)
2. Click "Get Started"
3. Sign up with email or GitHub
4. Verify your email address

### Step 2: Create Project

1. From the Sentry dashboard, click "Create Project"
2. Select platform: "Node.js" (for backend)
3. Configure:
   - **Project name**: dishswap-backend
   - **Alert frequency**: On every new issue
4. Click "Create Project"
5. Copy the DSN (Data Source Name) - looks like:
   ```
   https://abc123@o123456.ingest.sentry.io/789012
   ```

### Step 3: Create Frontend Project

Repeat for the frontend:

1. Click "Projects" → "Create Project"
2. Select platform: "React"
3. Configure:
   - **Project name**: dishswap-frontend
   - **Alert frequency**: On every new issue
4. Click "Create Project"
5. Copy the frontend DSN

### Step 4: Add to Environment Variables

Add both DSNs to your `.env` file:

```env
# Backend Sentry
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012

# Frontend Sentry
VITE_SENTRY_DSN=https://def456@o123456.ingest.sentry.io/789013
```

### Step 5: Configure Alerts

Set up email alerts for errors:

1. Navigate to your project settings
2. Click "Alerts" in the left sidebar
3. Click "Create Alert Rule"
4. Select "Issues"
5. Configure:
   - **When**: An event is first seen
   - **Then**: Send a notification via email
   - **To**: Your email address
6. Click "Save Rule"

### Step 6: Test Error Tracking

Test Sentry integration by triggering a test error:

1. Start your development server
2. Open browser console
3. Navigate to any page
4. Manually throw an error in console:
   ```javascript
   throw new Error("Test Sentry integration");
   ```
5. Check your Sentry dashboard for the error
6. You should receive an email notification

---

## Part 6: OpenAI API (Optional)

OpenAI API can be used for AI-powered features like content moderation, smart matching suggestions, or chatbot support.

### Step 1: Create OpenAI Account

1. Navigate to [platform.openai.com](https://platform.openai.com)
2. Click "Sign up"
3. Create account with email or Google
4. Verify your email address

### Step 2: Add Payment Method

OpenAI requires a payment method even for the free tier:

1. Navigate to "Settings" → "Billing"
2. Click "Add payment method"
3. Enter credit card information
4. Set a usage limit (recommended: $10/month for development)

### Step 3: Create API Key

1. Navigate to "API keys" in the left sidebar
2. Click "Create new secret key"
3. Configure:
   - **Name**: DishSwap Production
   - **Permissions**: All (or restrict to specific models)
4. Click "Create secret key"
5. Copy the key (starts with `sk-`)
6. Store securely (you won't see it again)

### Step 4: Add to Environment Variables

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 5: Test OpenAI Integration

Test the API by making a simple request:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-openai-api-key-here" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

You should receive a JSON response with the AI's reply.

---

## Part 7: Complete Environment Variables Reference

Here's a complete reference of all environment variables needed for DishSwap, organized by category.

### Core Configuration

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mysql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

### AWS S3 Configuration

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=dishswap-uploads
```

### Email Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@dishswap.com
```

### Google OAuth Configuration

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Facebook OAuth Configuration

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Google Maps Configuration

```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Sentry Configuration

```env
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
VITE_SENTRY_DSN=https://def456@o123456.ingest.sentry.io/789013
```

### OpenAI Configuration (Optional)

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Mobile App Environment Variables

The mobile app requires a separate `.env` file in the `dishswap-mobile` directory:

```env
# API Configuration
API_URL=http://localhost:3000

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
```

---

## Part 8: Security Best Practices

### Protecting API Keys

1. **Never commit `.env` files** to Git
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template (without real values)

2. **Use different keys for development and production**
   - Create separate projects/apps for each environment
   - Rotate production keys regularly (every 90 days)

3. **Restrict API key permissions**
   - AWS IAM: Only grant necessary S3 permissions
   - Google Maps: Restrict to specific domains
   - Sentry: Use separate projects for dev/prod

4. **Monitor API usage**
   - Set up billing alerts in AWS
   - Monitor Google Cloud quotas
   - Review Sentry event counts

### Key Rotation

Establish a regular key rotation schedule:

| Service | Rotation Frequency | Priority |
|---------|-------------------|----------|
| JWT Secret | Every 90 days | High |
| AWS Access Keys | Every 90 days | High |
| OAuth Secrets | Every 180 days | Medium |
| API Keys | Every 180 days | Medium |
| SMTP Passwords | Every 180 days | Low |

### Emergency Response

If a key is compromised:

1. **Immediately revoke** the compromised key
2. **Generate a new key** in the service console
3. **Update environment variables** in all environments
4. **Restart services** to apply new keys
5. **Review logs** for unauthorized access
6. **Notify users** if data was accessed

---

## Part 9: Troubleshooting

### S3 Upload Fails

**Symptom:** Photo upload returns error or hangs indefinitely

**Solutions:**

1. Verify AWS credentials are correct in `.env`
2. Check IAM user has `PutObject` permission
3. Verify bucket name matches `AWS_S3_BUCKET`
4. Check CORS configuration allows your domain
5. Ensure bucket region matches `AWS_REGION`
6. Review browser console for CORS errors

### Email Not Sending

**Symptom:** Verification emails never arrive

**Solutions:**

1. Check spam folder
2. Verify SMTP credentials in `.env`
3. For Gmail: Ensure 2FA is enabled and app password is used
4. For SendGrid: Verify sender identity
5. For SES: Check if account is out of sandbox mode
6. Test SMTP connection with a mail client
7. Review server logs for SMTP errors

### OAuth Redirect Fails

**Symptom:** After OAuth login, user sees error or blank page

**Solutions:**

1. Verify redirect URI matches exactly in console
2. Check OAuth consent screen is configured
3. Ensure test users are added (development mode)
4. Verify client ID and secret in `.env`
5. Check that user granted all required permissions
6. Review browser console for errors
7. Ensure cookies are enabled in browser

### Maps Not Loading

**Symptom:** Map component shows blank or error

**Solutions:**

1. Verify Google Maps API key in `.env`
2. Check that Maps JavaScript API is enabled
3. Verify domain is whitelisted in API key restrictions
4. Check browser console for API errors
5. Ensure billing is enabled in Google Cloud (required even for free tier)
6. Review daily quota limits

### Sentry Not Capturing Errors

**Symptom:** Errors don't appear in Sentry dashboard

**Solutions:**

1. Verify Sentry DSN is correct in `.env`
2. Check that Sentry is initialized in code
3. Ensure environment is not filtered in Sentry settings
4. Test with a manual error: `throw new Error("Test")`
5. Check network tab for failed Sentry requests
6. Verify project is not paused in Sentry

---

## Part 10: Cost Estimation

Understanding the costs of external services helps with budgeting and optimization.

### Free Tier Limits

| Service | Free Tier | Overage Cost |
|---------|-----------|--------------|
| AWS S3 | 5 GB storage, 20K GET requests/month | $0.023/GB, $0.0004/1K requests |
| Gmail SMTP | 500 emails/day | N/A (hard limit) |
| SendGrid | 100 emails/day | $19.95/month for 50K emails |
| Google Maps | $200 credit/month (~28K map loads) | $7/1K map loads |
| Sentry | 5K errors/month | $26/month for 50K errors |
| OpenAI | $5 free credit (expires after 3 months) | $0.002/1K tokens (GPT-3.5) |

### Monthly Cost Estimates

**Development (Free Tier):**
- AWS S3: $0
- Email: $0 (Gmail)
- Google Maps: $0 (within free credit)
- Sentry: $0
- **Total: $0/month**

**Small Production (1,000 users):**
- AWS S3: ~$2 (10 GB storage)
- Email: $19.95 (SendGrid)
- Google Maps: $0 (within free credit)
- Sentry: $0 (within free tier)
- OpenAI: ~$10 (moderate usage)
- **Total: ~$32/month**

**Medium Production (10,000 users):**
- AWS S3: ~$15 (100 GB storage)
- Email: $89.95 (SendGrid Pro)
- Google Maps: ~$50 (exceeds free credit)
- Sentry: $26 (Team plan)
- OpenAI: ~$50 (heavy usage)
- **Total: ~$231/month**

### Cost Optimization Tips

1. **Optimize image sizes** before uploading to S3 to reduce storage costs
2. **Use CloudFront CDN** for S3 to reduce bandwidth costs
3. **Batch email notifications** instead of sending individually
4. **Cache map data** to reduce API calls
5. **Filter Sentry events** to only capture actionable errors
6. **Use GPT-3.5** instead of GPT-4 for cost savings

---

## Support and Resources

If you encounter issues not covered in this guide, consult these resources:

- **AWS Documentation**: [docs.aws.amazon.com](https://docs.aws.amazon.com)
- **Google Cloud Documentation**: [cloud.google.com/docs](https://cloud.google.com/docs)
- **Facebook Developers**: [developers.facebook.com/docs](https://developers.facebook.com/docs)
- **SendGrid Documentation**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Sentry Documentation**: [docs.sentry.io](https://docs.sentry.io)
- **OpenAI Documentation**: [platform.openai.com/docs](https://platform.openai.com/docs)

For DishSwap-specific issues, open an issue on GitHub: [github.com/richard-d-lee/dishswap/issues](https://github.com/richard-d-lee/dishswap/issues)
