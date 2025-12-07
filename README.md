# DishSwap

A platform connecting home cooks with dishwashers for meal cleanup services. Built with React, tRPC, and Express.

## Features

- **User Authentication** - Email/password and social login (Google, Facebook)
- **Session Management** - Create, browse, and apply for dishwashing sessions
- **Real-time Messaging** - Chat between hosts and dishwashers
- **Rating System** - Rate and review completed sessions
- **Photo Upload** - Share photos of meals and completed work
- **Profile Management** - Separate profiles for hosts and dishwashers

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS 4
- tRPC for type-safe API calls
- Wouter for routing
- shadcn/ui components

### Backend
- Express 4
- tRPC 11 for API layer
- Drizzle ORM
- MySQL/TiDB database
- JWT authentication

### Services
- AWS S3 for file storage
- OpenAI API for LLM features
- Google Maps API for location services
- Nodemailer for email notifications

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- MySQL or TiDB database
- AWS S3 bucket
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-secret-key-here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# AWS S3 Storage
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# OpenAI (Optional)
OPENAI_API_KEY=your-openai-api-key

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Notifications (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=DishSwap <noreply@dishswap.com>
OWNER_EMAIL=admin@dishswap.com
```

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Database Management

```bash
# Generate migration
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Project Structure

```
client/
  src/
    pages/        # Page components
    components/   # Reusable UI components
    lib/          # Utilities and tRPC client
    _core/        # Core hooks and contexts
server/
  routers.ts      # tRPC API routes
  db.ts           # Database queries
  _core/          # Core server utilities
  auth/           # Authentication routes
drizzle/
  schema.ts       # Database schema
```

## Deployment

### Web Application

1. Build the application:
```bash
pnpm build
```

2. Deploy to your hosting provider (Vercel, Railway, Render, etc.)

3. Set environment variables in your hosting platform

### Mobile Application

See `/dishswap-mobile` directory for React Native mobile app.

## API Documentation

The application uses tRPC for type-safe APIs. Key routers:

- `auth` - Authentication (login, register, logout)
- `sessions` - Session management (create, browse, apply)
- `messages` - Real-time messaging
- `ratings` - Rating and review system
- `profiles` - User profile management
- `photos` - Photo upload and management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

## Links

- [GitHub Repository](https://github.com/richard-d-lee/dishswap)
- [Mobile App Repository](https://github.com/richard-d-lee/dishswap-mobile)
