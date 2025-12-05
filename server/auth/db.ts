import { eq, and, gt } from "drizzle-orm";
import { getDb } from "../db";
import {
  users,
  emailVerifications,
  passwordResets,
  refreshTokens,
  loginAttempts,
  oauthAccounts,
  type InsertUser,
  type InsertEmailVerification,
  type InsertPasswordReset,
  type InsertRefreshToken,
  type InsertLoginAttempt,
  type InsertOAuthAccount,
} from "../../drizzle/schema";

// ============= User Operations =============

export async function createUser(userData: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(userData);
  const userId = Number(result[0].insertId);
  
  const [newUser] = await db.select().from(users).where(eq(users.id, userId));
  return newUser;
}

export async function updateUser(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, userId));
  const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
  return updatedUser;
}

// ============= Email Verification =============

export async function createEmailVerification(data: InsertEmailVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(emailVerifications).values(data);
}

export async function getEmailVerification(token: string) {
  const db = await getDb();
  if (!db) return null;

  const [verification] = await db
    .select()
    .from(emailVerifications)
    .where(and(
      eq(emailVerifications.token, token),
      gt(emailVerifications.expiresAt, new Date())
    ))
    .limit(1);

  return verification || null;
}

export async function deleteEmailVerification(token: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(emailVerifications).where(eq(emailVerifications.token, token));
}

// ============= Password Reset =============

export async function createPasswordReset(data: InsertPasswordReset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(passwordResets).values(data);
}

export async function getPasswordReset(token: string) {
  const db = await getDb();
  if (!db) return null;

  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(and(
      eq(passwordResets.token, token),
      eq(passwordResets.used, false),
      gt(passwordResets.expiresAt, new Date())
    ))
    .limit(1);

  return reset || null;
}

export async function markPasswordResetAsUsed(token: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.token, token));
}

// ============= Refresh Tokens =============

export async function createRefreshToken(data: InsertRefreshToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(refreshTokens).values(data);
}

export async function getRefreshToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(and(
      eq(refreshTokens.token, token),
      gt(refreshTokens.expiresAt, new Date())
    ))
    .limit(1);

  return refreshToken || null;
}

export async function deleteRefreshToken(token: string) {
  const db = await getDb();
  if (!db) return;

  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

export async function deleteUserRefreshTokens(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

// ============= Login Attempts =============

export async function recordLoginAttempt(data: InsertLoginAttempt) {
  const db = await getDb();
  if (!db) return;

  await db.insert(loginAttempts).values(data);
}

export async function getRecentFailedAttempts(email: string, minutes: number = 15): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const since = new Date(Date.now() - minutes * 60 * 1000);
  const attempts = await db
    .select()
    .from(loginAttempts)
    .where(and(
      eq(loginAttempts.email, email),
      eq(loginAttempts.successful, false),
      gt(loginAttempts.createdAt, since)
    ));

  return attempts.length;
}

// ============= OAuth Accounts =============

export async function createOAuthAccount(data: InsertOAuthAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(oauthAccounts).values(data);
}

export async function getOAuthAccount(provider: string, providerAccountId: string) {
  const db = await getDb();
  if (!db) return null;

  const [account] = await db
    .select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.provider, provider),
      eq(oauthAccounts.providerAccountId, providerAccountId)
    ))
    .limit(1);

  return account || null;
}

export async function getUserOAuthAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(oauthAccounts).where(eq(oauthAccounts.userId, userId));
}
