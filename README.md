# DishSwap Web Application

**Trade Dishwashing for Delicious Meals**

DishSwap is a community platform that connects food lovers with people who enjoy home-cooked meals. Dishwashers get free meals, hosts get clean kitchens. A community built on sharing, trust, and great food.

🌐 **Live Demo**: [Coming Soon]  
📱 **Mobile Apps**: [iOS](https://github.com/richard-d-lee/dishswap-mobile) | [Android](https://github.com/richard-d-lee/dishswap-mobile)

## Features

### For Dishwashers
- 🍽️ **Free Delicious Meals** - Enjoy home-cooked food from talented local chefs
- 📍 **Set Your Range** - Choose how far you're willing to travel
- 🥗 **Manage Allergies** - List your dietary restrictions and preferences
- ⭐ **Build Reputation** - Get rated and build trust in the community

### For Hosts
- ✨ **Clean Kitchen** - Get help with dishes after cooking
- 👨‍🍳 **Share Your Cooking** - Showcase your food specialties
- 📅 **Flexible Scheduling** - Post sessions when it works for you
- 💬 **Direct Messaging** - Communicate with matched dishwashers

### Core Features
- 🔐 **Secure Authentication** - Email/password and OAuth (Google, Facebook)
- 👤 **Dual Role System** - Be a dishwasher, host, or both
- 📸 **Photo Uploads** - Add photos to your profile
- 💬 **Real-time Messaging** - Chat with other users
- ⭐ **Rating System** - Rate and review after each session
- 🔔 **Notifications** - Stay updated on session status
- 📊 **Dashboard** - Track your sessions and statistics

## Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **tRPC** - End-to-end typesafe APIs
- **Wouter** - Lightweight routing
- **Sonner** - Toast notifications

### Backend
- **Node.js + Express** - Server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - TypeScript ORM
- **MySQL/TiDB** - Relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Superjson** - JSON serialization with Date support

### Infrastructure
- **S3** - File storage for photos
- **Manus Platform** - Built-in hosting and analytics
- **Vitest** - Unit testing framework

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MySQL or TiDB database
- S3-compatible storage (provided by Manus)

### Installation

```bash
# Clone the repository
git clone https://github.com/richard-d-lee/dishswap.git
cd dishswap

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Required environment variables:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secure-random-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your-manus-app-id
BUILT_IN_FORGE_API_KEY=your-forge-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im
```

Optional OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

Optional email service (for verification):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@dishswap.com
```

## Project Structure

```
dishswap/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── lib/           # Utilities and tRPC client
│       ├── App.tsx        # Routes and layout
│       └── main.tsx       # Application entry point
├── server/                # Backend Express + tRPC
│   ├── _core/            # Core server infrastructure
│   ├── auth/             # Authentication logic
│   ├── db.ts             # Database query helpers
│   └── routers.ts        # tRPC procedure definitions
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database table definitions
├── shared/               # Shared types and constants
└── storage/              # S3 storage helpers
```

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Database
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)

# Testing
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode

# Code Quality
pnpm lint         # Lint code with ESLint
pnpm type-check   # Check TypeScript types
```

## Testing

The project includes comprehensive backend tests:

```bash
pnpm test
```

Test coverage:
- ✅ Authentication system (9 tests)
- ✅ Session workflow (10 tests)
- ✅ Mobile OAuth endpoints (4 tests)
- ✅ Logout functionality (1 test)

**Total: 24 passing tests**

## API Documentation

The API is built with tRPC, providing end-to-end type safety. Key routers:

### Authentication
- `auth.register` - Register new user
- `auth.login` - Login with email/password
- `auth.logout` - Logout current user
- `auth.me` - Get current user
- `auth.google.mobile` - Google OAuth for mobile
- `auth.facebook.mobile` - Facebook OAuth for mobile

### User Profiles
- `dishwasher.createProfile` - Create dishwasher profile
- `dishwasher.getProfile` - Get dishwasher profile
- `dishwasher.updateProfile` - Update dishwasher profile
- `host.createProfile` - Create host profile
- `host.getProfile` - Get host profile
- `host.updateProfile` - Update host profile

### Sessions
- `sessions.create` - Create new session
- `sessions.getOpen` - Browse open sessions
- `sessions.getById` - Get session details
- `sessions.getMyHostSessions` - Get my hosted sessions
- `sessions.getMyDishwasherSessions` - Get sessions I applied to
- `sessions.update` - Update session status

### Messaging
- `messages.send` - Send message
- `messages.getConversation` - Get conversation with user
- `messages.getConversations` - Get all conversations
- `messages.markAsRead` - Mark messages as read

### Ratings
- `ratings.create` - Rate user after session
- `ratings.getReceivedRatings` - Get ratings received

### Notifications
- `notifications.getAll` - Get all notifications
- `notifications.markAsRead` - Mark notification as read

## Deployment

### Option 1: Manus Hosting (Recommended)

1. Create a checkpoint in Manus
2. Click "Publish" in the Management UI
3. Your app is live at `your-prefix.manus.space`
4. Optionally configure a custom domain

### Option 2: External Hosting

Deploy to Vercel, Netlify, Railway, or any Node.js hosting service.

```bash
# Build the application
pnpm build

# Deploy the dist/ directory
```

See the [Production Deployment Guide](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed instructions.

## Mobile Applications

Native mobile apps for iOS and Android are available in a separate repository:

🔗 **[DishSwap Mobile](https://github.com/richard-d-lee/dishswap-mobile)**

Built with React Native and Expo, featuring:
- Native OAuth integration
- Push notifications
- Camera integration for photos
- Optimized mobile UI

## Documentation

Comprehensive guides are available:

- [OAuth Setup Guide](./docs/OAUTH_SETUP_GUIDE.md) - Configure Google and Facebook OAuth
- [Email Service Setup](./docs/EMAIL_SERVICE_SETUP_GUIDE.md) - Configure email verification
- [Production Deployment](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md) - Deploy to production
- [Monitoring Setup](./docs/MONITORING_SETUP_GUIDE.md) - Set up error tracking and analytics
- [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md) - Pre-launch checklist

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Passwords are hashed with bcrypt
- JWT tokens for secure authentication
- SQL injection prevention with parameterized queries
- CORS configured for production
- Rate limiting on API endpoints
- Input validation on all forms

## License

[Specify your license here]

## Support

For questions or issues:
- Open an issue on GitHub
- Contact: [your-email]
- Manus Support: https://help.manus.im

## Acknowledgments

Built with:
- [Manus AI Platform](https://manus.im)
- [tRPC](https://trpc.io)
- [React](https://react.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Made with ❤️ by the DishSwap Team**

⭐ Star this repo if you find it useful!
