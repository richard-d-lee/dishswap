# DishSwap Local Development Setup Guide

Complete guide for setting up the DishSwap application on your local machine for development.

---

## Overview

DishSwap consists of two applications that work together to create a complete marketplace platform for connecting home cooks with dishwashers. The web application provides the main user interface and API backend, while the mobile application offers native iOS and Android experiences. Both applications share the same backend API and database, ensuring a consistent experience across all platforms.

**Repositories:**
- Web Application: [https://github.com/richard-d-lee/dishswap](https://github.com/richard-d-lee/dishswap)
- Mobile Application: [https://github.com/richard-d-lee/dishswap-mobile](https://github.com/richard-d-lee/dishswap-mobile)

---

## Prerequisites

Before beginning the setup process, ensure you have the following software installed on your development machine. These tools are essential for running and developing the DishSwap applications.

| Tool | Version | Purpose | Download Link |
|------|---------|---------|---------------|
| Node.js | 22.x or later | JavaScript runtime for backend and build tools | [nodejs.org](https://nodejs.org) |
| pnpm | 10.x or later | Fast, disk space efficient package manager | [pnpm.io](https://pnpm.io) |
| Git | Latest | Version control system | [git-scm.com](https://git-scm.com) |
| MySQL | 8.0 or later | Database server (or use cloud provider) | [mysql.com](https://www.mysql.com) |

### Installing pnpm

If you don't have pnpm installed, you can install it globally using npm (which comes with Node.js):

```bash
npm install -g pnpm
```

Verify the installation by checking the version:

```bash
pnpm --version
```

---

## Part 1: Web Application Setup

The web application serves as both the user-facing website and the API backend that powers all features. It uses React 19 for the frontend, Express 4 for the backend, and tRPC 11 for type-safe API communication.

### Step 1: Clone the Repository

Begin by cloning the web application repository to your local machine:

```bash
git clone https://github.com/richard-d-lee/dishswap.git
cd dishswap
```

### Step 2: Install Dependencies

Install all required npm packages using pnpm. This process typically takes 2-3 minutes depending on your internet connection:

```bash
pnpm install
```

The installation will download and install over 1,000 packages including React, Express, tRPC, Drizzle ORM, and all their dependencies.

### Step 3: Set Up Database

DishSwap requires a MySQL database to store user data, sessions, ratings, and other information. You have two options for setting up the database: local MySQL installation or cloud-hosted database.

#### Option A: Local MySQL Database

If you have MySQL installed locally, create a new database:

```bash
mysql -u root -p
```

Then in the MySQL shell:

```sql
CREATE DATABASE dishswap;
CREATE USER 'dishswap_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON dishswap.* TO 'dishswap_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Your database URL will be:
```
mysql://dishswap_user:your_secure_password@localhost:3306/dishswap
```

#### Option B: Cloud Database (Recommended)

For easier setup and better reliability, consider using a cloud database provider. These services offer free tiers suitable for development:

**PlanetScale** (Recommended):
1. Visit [planetscale.com](https://planetscale.com) and create a free account
2. Create a new database named "dishswap"
3. Copy the connection string from the dashboard
4. Connection string format: `mysql://username:password@host/database?ssl={"rejectUnauthorized":true}`

**Railway**:
1. Visit [railway.app](https://railway.app) and sign up
2. Create a new project and add MySQL
3. Copy the `DATABASE_URL` from the Variables tab

**Render**:
1. Visit [render.com](https://render.com) and create an account
2. Create a new PostgreSQL database (free tier available)
3. Note: If using PostgreSQL instead of MySQL, you'll need to adjust the Drizzle configuration

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory of the project. This file contains all configuration settings for the application:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually with the following content:

```env
# Database Configuration
DATABASE_URL=mysql://dishswap_user:your_secure_password@localhost:3306/dishswap

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# AWS S3 Configuration (for photo uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=dishswap-uploads

# Email Configuration (for verification and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@dishswap.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# Facebook OAuth Configuration
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Maps API (for location features)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Sentry Error Tracking (optional for development)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/project-id
```

**Important Notes:**

- **JWT_SECRET**: Generate a secure random string using: `openssl rand -base64 32`
- **Database URL**: Use the connection string from Step 3
- **AWS S3**: Required for photo uploads. See External API Setup Guide for configuration
- **Email**: Required for email verification and password reset. Gmail requires an app-specific password
- **OAuth**: Required for social login. See External API Setup Guide for setup instructions
- **OpenAI**: Optional, only needed if using AI features
- **Google Maps**: Optional, only needed for location-based features
- **Sentry**: Optional for development, recommended for production

### Step 5: Initialize Database Schema

Run the database migrations to create all necessary tables:

```bash
pnpm db:push
```

This command will create the following tables in your database:

- `users` - User accounts and authentication
- `hostProfiles` - Host-specific profile information
- `dishwasherProfiles` - Dishwasher-specific profile information
- `sessions` - Meal sessions posted by hosts
- `applications` - Dishwasher applications to sessions
- `ratings` - Reviews and ratings between users
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `sessionPhotos` - Photos uploaded for sessions
- `photoFlags` - Photo moderation flags

### Step 6: Start Development Server

Start the development server which runs both the backend API and frontend with hot-reloading:

```bash
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/trpc

You should see output similar to:

```
[Sentry] SENTRY_DSN not configured, error tracking disabled
Server running on http://localhost:3000/
```

### Step 7: Verify Installation

Open your browser and navigate to `http://localhost:3000`. You should see the DishSwap homepage with the tagline "Trade Dishwashing for Delicious Meals".

Test the API health by visiting: `http://localhost:3000/api/trpc/auth.me`

You should see a JSON response (likely an error since you're not logged in, which is expected).

### Step 8: Run Tests

Verify that all backend tests pass:

```bash
pnpm test
```

You should see output showing 24 tests passing:

```
✓ server/auth/mobile-oauth.test.ts (4 tests)
✓ server/auth.logout.test.ts (1 test)
✓ server/auth/auth.test.ts (9 tests)
✓ server/sessions.workflow.test.ts (10 tests)

Test Files  4 passed (4)
     Tests  24 passed (24)
```

---

## Part 2: Mobile Application Setup

The mobile application provides native iOS and Android experiences using React Native and Expo. It connects to the same backend API as the web application.

### Step 1: Clone the Mobile Repository

Clone the mobile application repository:

```bash
cd ..
git clone https://github.com/richard-d-lee/dishswap-mobile.git
cd dishswap-mobile
```

### Step 2: Install Dependencies

Install all required packages:

```bash
pnpm install
```

### Step 3: Install Expo CLI

Install the Expo CLI globally if you haven't already:

```bash
npm install -g expo-cli eas-cli
```

### Step 4: Configure Environment Variables

Create a `.env` file in the mobile app root directory:

```env
# API Configuration
API_URL=http://localhost:3000

# Google OAuth (Android)
GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
```

**Important Notes:**

- **API_URL**: For iOS simulator, use `http://localhost:3000`. For Android emulator, use `http://10.0.2.2:3000`. For physical devices, use your computer's IP address (e.g., `http://192.168.1.100:3000`)
- **OAuth Configuration**: Must match the credentials configured in the web application

### Step 5: Update app.config.js

The `app.config.js` file is already configured to read from environment variables. Verify it contains:

```javascript
export default {
  expo: {
    name: "DishSwap",
    slug: "dishswap",
    // ... other config
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000",
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      facebookAppId: process.env.FACEBOOK_APP_ID,
    },
  },
};
```

### Step 6: Start Expo Development Server

Start the Expo development server:

```bash
npx expo start
```

You'll see a QR code and several options:

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### Step 7: Run on Simulator/Emulator

**For iOS (macOS only):**

Press `i` to open in iOS Simulator. The first time may take a few minutes to build.

**For Android:**

Ensure you have Android Studio installed with an emulator set up, then press `a` to open in Android Emulator.

**For Physical Device:**

1. Install the Expo Go app from the App Store (iOS) or Google Play Store (Android)
2. Scan the QR code with your camera (iOS) or the Expo Go app (Android)
3. Make sure your phone and computer are on the same WiFi network
4. Update `API_URL` in `.env` to use your computer's local IP address

### Step 8: Verify Mobile App

The mobile app should load and display the login screen. Try navigating through the app to verify it's working correctly. Note that OAuth login won't work in Expo Go - you'll need to create a development build for full OAuth functionality.

---

## Part 3: Development Workflow

Now that both applications are set up, here's the recommended workflow for development.

### Running Both Applications Simultaneously

Open two terminal windows:

**Terminal 1 - Web Application:**
```bash
cd dishswap
pnpm dev
```

**Terminal 2 - Mobile Application:**
```bash
cd dishswap-mobile
npx expo start
```

### Making Code Changes

The development servers support hot-reloading, meaning changes you make to the code will automatically refresh in the browser or mobile app.

**Backend Changes (server/ directory):**
- Changes to tRPC procedures, database queries, or server logic will automatically restart the server
- Wait a few seconds for the server to restart before testing

**Frontend Changes (client/ directory):**
- Changes to React components will hot-reload instantly
- No need to refresh the browser

**Mobile Changes (src/ directory):**
- Changes will hot-reload in the Expo app
- Some changes may require manually reloading (shake device and tap "Reload")

### Database Management

**View Database Schema:**
```bash
pnpm db:studio
```

This opens Drizzle Studio, a web-based database viewer at `https://local.drizzle.studio`

**Push Schema Changes:**

After modifying `drizzle/schema.ts`:
```bash
pnpm db:push
```

**Generate Migrations:**
```bash
pnpm drizzle-kit generate
```

### Running Tests

**Run all tests:**
```bash
pnpm test
```

**Run tests in watch mode:**
```bash
pnpm test --watch
```

**Run specific test file:**
```bash
pnpm test server/auth/auth.test.ts
```

### Debugging

**Backend Debugging:**

Add `console.log()` statements in your server code. They will appear in the terminal where you ran `pnpm dev`.

For more advanced debugging, use VS Code's debugger:
1. Add a breakpoint in your code
2. Press F5 to start debugging
3. Select "Node.js" as the environment

**Frontend Debugging:**

Use browser DevTools:
1. Open Chrome DevTools (F12)
2. Go to Console tab for logs
3. Go to Network tab to inspect API calls
4. Go to React DevTools for component inspection

**Mobile Debugging:**

Use React Native Debugger:
1. Install React Native Debugger from [github.com/jhen0409/react-native-debugger](https://github.com/jhen0409/react-native-debugger)
2. Shake your device or press Cmd+D (iOS) / Cmd+M (Android)
3. Select "Debug" from the menu

---

## Part 4: Common Issues and Solutions

### Issue: Port 3000 Already in Use

**Symptom:** Error message "Port 3000 is already in use"

**Solution:**

Find and kill the process using port 3000:

```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=3001
```

### Issue: Database Connection Failed

**Symptom:** Error message "Connection refused" or "Access denied"

**Solutions:**

1. Verify MySQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   ```

2. Check DATABASE_URL format:
   ```
   mysql://username:password@host:port/database
   ```

3. Test connection manually:
   ```bash
   mysql -h localhost -u dishswap_user -p dishswap
   ```

### Issue: pnpm install Fails

**Symptom:** Errors during package installation

**Solutions:**

1. Clear pnpm cache:
   ```bash
   pnpm store prune
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 22.x or later
   ```

### Issue: Mobile App Won't Connect to API

**Symptom:** Network errors in mobile app

**Solutions:**

1. For Android emulator, use `http://10.0.2.2:3000` instead of `localhost`

2. For physical device, use your computer's local IP:
   ```bash
   # Find your IP on macOS/Linux
   ifconfig | grep "inet "
   
   # Find your IP on Windows
   ipconfig
   ```
   
   Update `.env` in mobile app:
   ```env
   API_URL=http://192.168.1.100:3000
   ```

3. Ensure firewall allows connections on port 3000

### Issue: OAuth Login Not Working

**Symptom:** OAuth redirect fails or shows error

**Solutions:**

1. Verify OAuth credentials are correctly configured in `.env`

2. Check redirect URIs in Google/Facebook console match your local URL:
   - Web: `http://localhost:3000/api/auth/google/callback`
   - Mobile: Requires development build (won't work in Expo Go)

3. For mobile OAuth, create a development build:
   ```bash
   eas build --profile development --platform ios
   ```

---

## Part 5: Next Steps

Once you have the application running locally, consider these next steps:

### 1. Configure External APIs

Follow the External API Setup Guide to configure:
- AWS S3 for photo uploads
- Google OAuth for social login
- Facebook OAuth for social login
- SMTP for email sending
- OpenAI API for AI features
- Google Maps API for location features

### 2. Seed Test Data

Create test users and sessions for development:

```bash
# Create a seed script
node scripts/seed-db.js
```

Example seed script content:

```javascript
import { db } from './server/db.js';
import { users, hostProfiles, sessions } from './drizzle/schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
  // Create test host
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const [host] = await db.insert(users).values({
    email: 'host@example.com',
    password: hashedPassword,
    name: 'Test Host',
    role: 'user',
    emailVerified: true,
  }).returning();
  
  await db.insert(hostProfiles).values({
    userId: host.id,
    bio: 'Love cooking Italian food!',
    cuisineTypes: JSON.stringify(['Italian', 'Mediterranean']),
  });
  
  // Create test session
  await db.insert(sessions).values({
    hostId: host.id,
    title: 'Italian Dinner',
    description: 'Making fresh pasta',
    date: new Date(Date.now() + 86400000), // Tomorrow
    dishCount: 15,
    estimatedDuration: 90,
    status: 'open',
  });
  
  console.log('Seed data created successfully!');
}

seed().catch(console.error);
```

### 3. Explore the Codebase

Key directories to understand:

- `server/routers.ts` - All tRPC API procedures
- `server/db.ts` - Database query functions
- `drizzle/schema.ts` - Database schema definitions
- `client/src/pages/` - Frontend page components
- `client/src/components/` - Reusable UI components
- `server/auth/` - Authentication logic

### 4. Set Up Your IDE

**VS Code Extensions (Recommended):**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Expo Tools

**Configure VS Code Settings:**

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Part 6: Development Best Practices

### Code Organization

The codebase follows a clear structure to maintain organization as the application grows. Backend logic resides in the `server/` directory, with tRPC procedures defined in `routers.ts` and database queries in `db.ts`. Frontend components are organized in `client/src/`, with pages in the `pages/` directory and reusable components in `components/`. Shared types and constants live in the `shared/` directory, accessible to both frontend and backend.

### Type Safety

DishSwap leverages TypeScript and tRPC to provide end-to-end type safety. When you define a tRPC procedure, the types automatically flow to the frontend, eliminating the need for manual type definitions. Always define input schemas using Zod in your tRPC procedures, and let TypeScript infer return types from your database queries. This approach catches errors at compile-time rather than runtime.

### Database Queries

Use the Drizzle ORM query builder for all database operations rather than raw SQL. This provides type safety and prevents SQL injection vulnerabilities. Keep database queries in `server/db.ts` as reusable functions, and call these functions from your tRPC procedures. Always use transactions for operations that modify multiple tables to ensure data consistency.

### Error Handling

Implement proper error handling throughout the application. Use tRPC's built-in error types (`TRPCError`) for API errors, and always provide meaningful error messages. On the frontend, display user-friendly error messages using toast notifications. Log errors to the console in development and to Sentry in production for monitoring and debugging.

### Testing

Write tests for critical functionality, especially authentication, session workflows, and payment processing. The test suite uses Vitest and can be run with `pnpm test`. Focus on testing business logic and API endpoints rather than UI components. Aim for at least 80% code coverage on backend code.

---

## Support and Resources

If you encounter issues not covered in this guide, consult these resources:

- **DishSwap GitHub Issues**: [github.com/richard-d-lee/dishswap/issues](https://github.com/richard-d-lee/dishswap/issues)
- **tRPC Documentation**: [trpc.io/docs](https://trpc.io/docs)
- **Drizzle ORM Documentation**: [orm.drizzle.team/docs](https://orm.drizzle.team/docs)
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **React Documentation**: [react.dev](https://react.dev)

For questions or support, open an issue on GitHub with detailed information about your problem, including error messages, environment details, and steps to reproduce.
