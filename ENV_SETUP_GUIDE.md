# Environment Variables Setup Guide

This guide explains all environment variables needed to run DishSwap.

## Required Variables

### Database

```env
DATABASE_URL=mysql://user:password@host:port/database
```

**How to get it:**
- Use any MySQL-compatible database (MySQL, TiDB, PlanetScale, etc.)
- Format: `mysql://username:password@hostname:port/database_name`
- Example: `mysql://root:password@localhost:3306/dishswap`

### JWT Secret

```env
JWT_SECRET=your-random-secret-key-here
```

**How to generate:**
```bash
# Generate a random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### AWS S3 Storage

```env
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**How to set up:**
1. Create an AWS account at https://aws.amazon.com
2. Go to S3 console and create a new bucket
3. Go to IAM console and create a new user with S3 permissions
4. Generate access keys for the user
5. Set the bucket to public read (or configure appropriate permissions)

**IAM Policy for S3:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Optional Variables

### Google OAuth

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### Facebook OAuth

```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

**How to get it:**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Set valid OAuth redirect URIs:
   - `http://localhost:3000/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)

### OpenAI API

```env
OPENAI_API_KEY=sk-...
```

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an account and add billing
3. Go to API Keys section
4. Create a new API key

**Note:** Only needed if you use AI features in the app.

### Google Maps API

```env
GOOGLE_MAPS_API_KEY=AIza...
```

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API, Geocoding API, and Places API
3. Go to Credentials → Create Credentials → API Key
4. Restrict the API key to your domain (optional but recommended)

**Note:** Only needed if you use location features.

### Email Notifications (SMTP)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=DishSwap <noreply@dishswap.com>
OWNER_EMAIL=admin@dishswap.com
```

**Gmail Setup:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"
4. Use the generated password as `SMTP_PASS`

**Alternative SMTP Providers:**
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.us-east-1.amazonaws.com:587`

## Development vs Production

### Development (.env.local)

```env
DATABASE_URL=mysql://root:password@localhost:3306/dishswap_dev
JWT_SECRET=dev-secret-key-change-in-production
AWS_S3_BUCKET=dishswap-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Production (.env.production)

```env
DATABASE_URL=mysql://user:password@prod-host:3306/dishswap
JWT_SECRET=<secure-random-64-char-string>
AWS_S3_BUCKET=dishswap-prod
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
OPENAI_API_KEY=...
GOOGLE_MAPS_API_KEY=...
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=DishSwap <noreply@dishswap.com>
OWNER_EMAIL=admin@dishswap.com
```

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use strong secrets**
   - Generate random JWT secrets (64+ characters)
   - Rotate secrets periodically

3. **Restrict API keys**
   - Set domain restrictions on Google API keys
   - Use IAM roles with minimal permissions for AWS

4. **Use environment-specific values**
   - Different databases for dev/staging/prod
   - Different S3 buckets for each environment

5. **Store secrets securely**
   - Use secret management services (AWS Secrets Manager, etc.)
   - Never log or expose secrets in error messages

## Troubleshooting

### Database Connection Errors

- Check that MySQL is running
- Verify connection string format
- Ensure user has proper permissions
- Check firewall rules

### S3 Upload Errors

- Verify IAM user has S3 permissions
- Check bucket exists and is in correct region
- Ensure bucket policy allows uploads
- Verify access keys are correct

### OAuth Errors

- Check redirect URIs match exactly
- Ensure OAuth app is in production mode (not testing)
- Verify client ID and secret are correct
- Check that required scopes are enabled

### SMTP Errors

- Verify SMTP credentials
- Check that 2FA is enabled for Gmail
- Ensure app password is used (not account password)
- Verify SMTP host and port are correct
