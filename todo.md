# DishSwap TODO

## Database Schema & Models
- [x] Create users table extensions for profile data
- [x] Create dishwasher_profiles table
- [x] Create host_profiles table
- [x] Create allergies and user_allergies tables
- [x] Create food_specialties and related junction tables
- [x] Create profile_photos table
- [x] Create sessions table for dishwashing sessions
- [x] Create ratings table
- [x] Create matches table
- [x] Create notifications table
- [x] Create messages table (optional)
- [x] Push database schema to production

## Backend API (tRPC Procedures)
- [x] Implement user profile management procedures
- [x] Implement dishwasher profile CRUD procedures
- [x] Implement host profile CRUD procedures
- [x] Implement allergy management procedures
- [x] Implement food specialty management procedures
- [x] Implement photo upload and management procedures
- [x] Implement session creation and management procedures
- [x] Implement matching algorithm and procedures
- [x] Implement rating and review procedures
- [x] Implement notification procedures
- [ ] Implement geolocation search procedures
- [ ] Add unit tests for critical procedures

## Web Application - Core Features
- [x] Design color scheme and typography
- [x] Create landing page with value proposition
- [x] Implement user registration flow
- [x] Implement user profile setup (choose role: dishwasher/host/both)
- [x] Create dishwasher profile page with work range, allergies, preferences
- [x] Create host profile page with address, food specialties
- [ ] Implement photo upload and gallery management
- [ ] Create session posting interface for hosts
- [x] Create session browsing interface for dishwashers
- [ ] Implement matching recommendations display
- [ ] Create session detail page
- [ ] Implement session acceptance/decline workflow
- [ ] Create rating and review interface
- [ ] Implement notification center
- [x] Create user dashboard showing active/past sessions
- [ ] Implement search and filter functionality
- [ ] Add map view for nearby opportunities
- [ ] Create messaging interface (optional)

## Web Application - UI/UX Polish
- [ ] Add loading states and skeletons
- [ ] Implement error handling and user feedback
- [ ] Add responsive design for mobile web
- [ ] Implement accessibility features
- [ ] Add empty states for lists and galleries
- [ ] Create onboarding tour for new users

## Mobile Application - Setup
- [ ] Initialize React Native project with Expo
- [ ] Set up navigation structure
- [ ] Configure environment variables
- [ ] Set up tRPC client for mobile
- [ ] Implement OAuth authentication flow
- [ ] Configure push notifications

## Mobile Application - Features
- [ ] Create mobile landing/login screen
- [ ] Implement user profile screens
- [ ] Create dishwasher profile management
- [ ] Create host profile management
- [ ] Implement photo upload from camera/gallery
- [ ] Create session browsing interface
- [ ] Implement session posting interface
- [ ] Create matching recommendations view
- [ ] Implement rating and review screens
- [ ] Create notification handling
- [ ] Implement map view with location services
- [ ] Add messaging interface (optional)
- [ ] Implement session history view

## Mobile Application - Native Features
- [ ] Integrate camera for profile photos
- [ ] Implement geolocation services
- [ ] Configure push notifications
- [ ] Add biometric authentication (optional)
- [ ] Implement offline support (optional)

## Testing & Quality Assurance
- [ ] Test user registration and profile setup
- [ ] Test session creation and matching flow
- [ ] Test rating and review system
- [ ] Test photo upload and display
- [ ] Test geolocation and search
- [ ] Test notifications
- [ ] Test mobile app on iOS simulator
- [ ] Test mobile app on Android emulator
- [ ] Cross-browser testing for web app
- [ ] Performance testing and optimization

## Deployment & Documentation
- [ ] Create production build of web application
- [ ] Save checkpoint for web application
- [ ] Build iOS app with EAS Build
- [ ] Build Android app with EAS Build
- [ ] Write App Store submission guide
- [ ] Write Google Play Store submission guide
- [ ] Create user documentation
- [ ] Create developer documentation
- [ ] Prepare demo video/screenshots for app stores

## Future Enhancements (Post-Launch)
- [ ] Implement in-app payments (optional)
- [ ] Add social sharing features
- [ ] Implement referral system
- [ ] Add analytics and tracking
- [ ] Create admin dashboard
- [ ] Implement dispute resolution system
- [ ] Add multi-language support

## React Native Mobile App
- [x] Initialize React Native project with Expo
- [x] Set up navigation structure (bottom tabs + stack navigator)
- [x] Create authentication context with secure storage
- [x] Implement tRPC client configuration
- [x] Create login screen
- [x] Create home screen with quick actions
- [x] Create dashboard screen
- [x] Create browse sessions screen
- [x] Create profile screen
- [x] Create setup profile screen
- [x] Create session detail screen
- [x] Create create session screen
- [x] Create notifications screen
- [x] Configure app.json with all required permissions
- [x] Create EAS build configuration
- [x] Write comprehensive README for mobile app
- [x] Create detailed app store submission guide

## Documentation
- [x] App store submission guide with step-by-step instructions
- [x] iOS App Store submission process
- [x] Google Play Store submission process
- [x] Privacy policy requirements
- [x] Screenshot and asset requirements
- [x] Common issues and solutions

## Phase 2: Complete Implementation

### Mobile App - Full Screen Implementation
- [x] Implement ProfileScreen with photo upload and editing
- [x] Implement SetupProfileScreen with complete forms and validation
- [x] Implement BrowseSessionsScreen with tRPC queries and filtering
- [x] Implement SessionDetailScreen with full session info and actions
- [x] Implement CreateSessionScreen with form validation
- [x] Implement NotificationsScreen with real-time updates
- [x] Implement DashboardScreen with stats and recent activity
- [ ] Add image picker integration for profile photos
- [ ] Add location services for finding nearby sessions
- [ ] Add push notification setup

### Web App - Remaining Features
- [ ] Implement session detail page
- [ ] Implement create session page for hosts
- [ ] Implement photo upload and gallery
- [ ] Implement allergy and specialty management pages
- [ ] Implement rating and review interface
- [ ] Implement messaging interface
- [ ] Implement notification center
- [ ] Add map view for nearby sessions
- [ ] Implement search and filter functionality

### Real-time Features
- [ ] Set up Socket.IO on backend
- [ ] Implement real-time notifications
- [ ] Implement real-time messaging
- [ ] Add session status updates
- [ ] Add online/offline status

### Production Readiness
- [ ] Create production environment configuration
- [ ] Add error tracking and logging
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Create deployment scripts
- [ ] Write deployment documentation
- [ ] Create build scripts for mobile apps
- [ ] Test all features end-to-end


## Session Workflow Backend Implementation
- [x] Add applyForSession procedure
- [x] Add confirmSession procedure
- [x] Add updateStatus procedure
- [x] Add getMySessions procedure
- [x] Add updateSession helper to db.ts
- [x] Add getUserSessions helper to db.ts
- [x] Add createNotification helper to db.ts
- [x] Test session workflow end-to-end

## Messaging System Implementation
- [x] Add send message procedure
- [x] Add getConversation procedure
- [x] Add getConversations procedure
- [x] Add markAsRead procedure for messages
- [x] Add helper functions to db.ts
- [ ] Test messaging system

## Enhanced Matching Algorithm
- [x] Add findMatches procedure with filters
- [x] Implement date range filtering
- [x] Implement cuisine type filtering
- [x] Add distance calculation helper (TODO for production)
- [x] Test matching algorithm


## Web UI Features - Phase 2
- [x] Create SessionDetail page with apply button and status updates
- [x] Create Messages page with conversation list
- [x] Create ChatView component for individual conversations
- [x] Create RateUser page for submitting ratings after sessions
- [ ] Create ViewRatings component to display user ratings on profiles
- [ ] Create ViewRatings page to display user ratings
- [x] Create CreateSession page for hosts with date picker and form validation
- [ ] Create ManageSessions page for hosts to view and manage their sessions
- [x] Update Dashboard with links to new pages
- [x] Update App.tsx with new routes
- [x] Complete mobile app SetupProfileScreen implementation
- [x] Complete mobile app CreateSessionScreen implementation
- [x] Complete mobile app NotificationsScreen implementation
- [ ] Test all new pages


## Photo Upload Implementation
- [x] Add photo upload component to web SetupProfile page
- [ ] Add photo upload to web Profile editing (TODO: create profile edit page)
- [ ] Update profile photo display in Dashboard (TODO: add photo display)
- [x] Install React Native Image Picker for mobile
- [x] Add photo upload to mobile SetupProfileScreen
- [ ] Add photo upload to mobile ProfileScreen (TODO: needs implementation)
- [ ] Test photo upload on web
- [ ] Test photo upload on mobile


## Custom Authentication System Implementation

### Database Schema
- [x] Add password field to users table (hashed with bcrypt)
- [x] Create email_verifications table for verification tokens
- [x] Create password_resets table for reset tokens
- [x] Create oauth_accounts table for social login linking
- [x] Create sessions table for session management (using refreshTokens)
- [x] Create login_attempts table for rate limiting
- [x] Push database schema changes

### Backend - Email/Password Auth
- [x] Install dependencies (bcrypt, jsonwebtoken, nodemailer, passport)
- [x] Create password hashing utilities
- [x] Implement JWT token generation and verification
- [x] Create register endpoint with email validation
- [x] Create login endpoint with password verification
- [x] Create logout endpoint
- [x] Create refresh token endpoint
- [x] Add password strength validation

### Backend - Email Verification
- [ ] Create email verification token generation
- [ ] Implement email sending service with nodemailer
- [ ] Create verify-email endpoint
- [ ] Create resend-verification endpoint
- [ ] Add email templates for verification

### Backend - Password Reset
- [ ] Create password reset token generation
- [ ] Implement forgot-password endpoint
- [ ] Implement reset-password endpoint
- [ ] Add email templates for password reset
- [ ] Add token expiration (15 minutes)

### Backend - Social OAuth
- [ ] Configure Passport.js with Google strategy
- [ ] Configure Passport.js with Facebook strategy
- [ ] Configure Passport.js with GitHub strategy
- [ ] Create OAuth callback handlers
- [ ] Implement account linking (connect social to existing account)
- [ ] Extract profile data from OAuth providers

### Backend - Security
- [ ] Implement rate limiting middleware
- [ ] Add CSRF protection
- [ ] Create account lockout after failed attempts
- [ ] Add session management endpoints
- [ ] Implement refresh token rotation
- [ ] Add security headers middleware

### Web UI - Authentication
- [ ] Create Login page
- [ ] Create Register page
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Create Email Verification page
- [ ] Add social login buttons
- [ ] Update navigation for auth state
- [ ] Add protected route wrapper

### Mobile - Authentication
- [ ] Create Login screen
- [ ] Create Register screen
- [ ] Create Forgot Password screen
- [ ] Implement secure token storage
- [ ] Add social OAuth for mobile
- [ ] Update navigation for auth state

### Testing & Documentation
- [ ] Write unit tests for auth endpoints
- [ ] Test email/password flow
- [ ] Test social OAuth flows
- [ ] Test password reset flow
- [ ] Create OAuth setup guide
- [ ] Create email service configuration guide
- [ ] Document environment variables needed


## Mobile App Authentication Implementation
- [x] Install @react-native-async-storage/async-storage
- [x] Create LoginScreen for React Native
- [x] Create RegisterScreen for React Native
- [x] Create ForgotPasswordScreen for React Native
- [x] Update AuthContext to use AsyncStorage for token storage
- [x] Configure tRPC client to include Authorization header with JWT
- [x] Update navigation to handle authenticated/unauthenticated states
- [ ] Test login flow on mobile
- [ ] Test registration flow on mobile
- [ ] Test token persistence across app restarts
