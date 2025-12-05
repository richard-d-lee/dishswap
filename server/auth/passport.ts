import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { getDb } from '../db';
import { users, oauthAccounts } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Environment variables for OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface OAuthProfile {
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  provider: string;
}

async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const email = profile.emails?.[0]?.value;
  const providerAccountId = profile.id;
  const provider = profile.provider;

  // Check if OAuth account already exists
  const existingOAuth = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId)
      )
    )
    .limit(1);

  if (existingOAuth.length > 0) {
    // OAuth account exists, get the user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, existingOAuth[0].userId))
      .limit(1);

    return user[0];
  }

  // Check if user with this email already exists
  let user;
  if (email) {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    user = existingUsers[0];
  }

  // Create new user if doesn't exist
  if (!user) {
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || null;
    const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || null;

    const insertResult: any = await db.insert(users).values({
      email: email || '',
      firstName,
      lastName,
      emailVerified: true, // OAuth emails are pre-verified
      role: 'user',
    });

    const userId = Number(insertResult.insertId);

    user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(rows => rows[0]);
  }

  // Link OAuth account to user
  await db.insert(oauthAccounts).values({
    userId: user.id,
    provider,
    providerAccountId,
    accessToken: null as any, // We don't store access tokens for security
    refreshToken: null as any,
  });

  return user;
}

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(profile as OAuthProfile);
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'name', 'emails', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(profile as OAuthProfile);
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(rows => rows[0]);

    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
