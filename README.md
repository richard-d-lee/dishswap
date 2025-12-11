# DishSwap

A marketplace platform connecting dishwashers with hosts who provide free meals in exchange for dishwashing services.

## Features

- **Custom Authentication**: Email/password registration and login with JWT tokens
- **Social OAuth**: Sign in with Google or Facebook
- **User Profiles**: Separate profiles for hosts and dishwashers with photos, ratings, and badges
- **Session Management**: Create, browse, and apply for dishwashing sessions
- **Real-time Messaging**: Socket.IO-powered chat between hosts and dishwashers
- **Photo Uploads**: AWS S3 integration for profile and session photos
- **Ratings & Reviews**: Bidirectional rating system with detailed reviews
- **Gamification**: Achievement badges (Top Host, Pro Dishwasher, Century Club, etc.)
- **Admin Moderation**: Flag and moderate inappropriate photos
- **Geolocation Search**: Find sessions near you with distance filtering
- **Email Notifications**: Account verification and password reset emails

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- TailwindCSS 4
- tRPC client
- Socket.IO client
- Sentry (error tracking)

**Backend:**
- Node.js + Express
- tRPC 11 (type-safe API)
- MySQL with Drizzle ORM
- Socket.IO (real-time features)
- JWT authentication
- Passport.js (OAuth)
- Bcrypt (password hashing)
- Nodemailer (email sending)

**External Services:**
- AWS S3 (photo storage)
- Google OAuth & Maps API
- Facebook OAuth
- OpenAI API (optional)
- Sentry (error tracking)

## Prerequisites

- Node.js 22.x or later
- pnpm 10.x or later
- MySQL 8.0+ (or PlanetScale account)
- AWS account (for S3)
- Gmail account (for SMTP) or SendGrid account

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/richard-d-lee/dishswap.git
cd dishswap
```

### 2. Install Dependencies

```bash
pnpm install
```

**Windows users:** The package.json includes `cross-env` for Windows compatibility.

### 3. Set Up Database

**Option A: Local MySQL**

```sql
CREATE DATABASE dishswap;
CREATE USER 'dishswap_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON dishswap.* TO 'dishswap_user'@'localhost';
FLUSH PRIVILEGES;
```

**Option B: PlanetScale (Recommended)**

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a database named "dishswap"
3. Copy the connection string

### 4. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**
- `DATABASE_URL` - Your MySQL connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `AWS_ACCESS_KEY_ID` - From AWS IAM
- `AWS_SECRET_ACCESS_KEY` - From AWS IAM
- `AWS_S3_BUCKET` - Your S3 bucket name
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` - Email service credentials

**Optional variables:**
- Google OAuth credentials
- Facebook OAuth credentials
- Google Maps API key
- OpenAI API key
- Sentry DSN

See `docs/DISHSWAP_EXTERNAL_API_SETUP_GUIDE.md` for detailed setup instructions for each service.

### 5. Initialize Database

```bash
pnpm db:push
```

This creates all necessary tables in your database.

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### 7. Create an Account

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign Up"
3. Fill in your details and create an account
4. Check your email for verification link (if SMTP is configured)
5. Log in and set up your profile

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
dishswap/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # tRPC client, utilities
│   │   └── _core/       # Framework code (auth hooks, etc.)
│   └── index.html
├── server/              # Backend Express + tRPC
│   ├── routers.ts       # tRPC procedures
│   ├── db.ts            # Database queries
│   ├── auth/            # Authentication logic
│   └── _core/           # Framework code (server setup, etc.)
├── drizzle/             # Database schema and migrations
│   └── schema.ts
├── shared/              # Shared types and constants
├── docs/                # Documentation
└── package.json
```

## Authentication System

DishSwap uses a custom authentication system with:

- **Email/Password**: Bcrypt-hashed passwords, JWT access and refresh tokens
- **Email Verification**: Nodemailer sends verification emails
- **Password Reset**: Secure token-based password reset flow
- **Social OAuth**: Google and Facebook login via Passport.js
- **Session Management**: HTTP-only cookies for security

All authentication routes are under `/api/auth`:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

## Testing

Run the test suite:

```bash
pnpm test
```

All 24 backend tests should pass, covering:
- Authentication (register, login, logout, OAuth)
- Session workflow (create, apply, confirm, update status)
- Messaging system
- User profiles

## Deployment

See the deployment guides in the `docs/` directory:

- **Local Setup**: `docs/DISHSWAP_LOCAL_SETUP_GUIDE.md`
- **Render Deployment**: `docs/DISHSWAP_RENDER_DEPLOYMENT_GUIDE.md`
- **External APIs**: `docs/DISHSWAP_EXTERNAL_API_SETUP_GUIDE.md`

## Mobile App

The React Native mobile app is in a separate repository:

```bash
git clone https://github.com/richard-d-lee/dishswap-mobile.git
```

See the mobile app README for setup instructions.

## Common Issues

### Port 3000 Already in Use

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

1. Verify MySQL is running
2. Check `DATABASE_URL` format in `.env`
3. Test connection: `mysql -h localhost -u dishswap_user -p`

### Photo Upload Fails

1. Verify AWS credentials in `.env`
2. Check S3 bucket CORS configuration
3. Ensure IAM user has `PutObject` permission

### Email Not Sending

1. For Gmail: Enable 2FA and use app-specific password
2. For SendGrid: Verify sender identity
3. Check SMTP credentials in `.env`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub: [github.com/richard-d-lee/dishswap/issues](https://github.com/richard-d-lee/dishswap/issues)
- Check the documentation in the `docs/` directory
- Review the External API Setup Guide for service-specific help

## Links

- [GitHub Repository](https://github.com/richard-d-lee/dishswap)
- [Mobile App Repository](https://github.com/richard-d-lee/dishswap-mobile)

## Acknowledgments

Built with:
- [React](https://react.dev)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [TailwindCSS](https://tailwindcss.com)
- [Expo](https://expo.dev)
- [Socket.IO](https://socket.io)
