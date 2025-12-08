import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }), // Null for OAuth-only users
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Profile extensions
  userType: mysqlEnum("userType", ["dishwasher", "host", "both"]).notNull().default("dishwasher"),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 500 }),
  bio: text("bio"),
  dateOfBirth: timestamp("dateOfBirth"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export const dishwasherProfiles = mysqlTable("dishwasherProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workRangeKm: int("workRangeKm").default(10).notNull(),
  hourlyRateDishes: int("hourlyRateDishes").default(0).notNull(),
  experienceYears: int("experienceYears").default(0).notNull(),
  availabilitySchedule: json("availabilitySchedule"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  totalDishesDone: int("totalDishesDone").default(0).notNull(),
  averageRating: int("averageRating").default(0).notNull(), // Store as integer (rating * 100)
  totalRatings: int("totalRatings").default(0).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const hostProfiles = mysqlTable("hostProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  addressLine1: varchar("addressLine1", { length: 255 }).notNull(),
  addressLine2: varchar("addressLine2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  typicalDishCount: int("typicalDishCount").default(0).notNull(),
  kitchenSize: mysqlEnum("kitchenSize", ["small", "medium", "large"]).default("medium").notNull(),
  hasDishwasherMachine: boolean("hasDishwasherMachine").default(false).notNull(),
  averageRating: int("averageRating").default(0).notNull(), // Store as integer (rating * 100)
  totalRatings: int("totalRatings").default(0).notNull(),
  totalSessionsHosted: int("totalSessionsHosted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const allergies = mysqlTable("allergies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userAllergies = mysqlTable("userAllergies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  allergyId: int("allergyId").notNull(),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]).default("moderate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const foodSpecialties = mysqlTable("foodSpecialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hostFoodSpecialties = mysqlTable("hostFoodSpecialties", {
  id: int("id").autoincrement().primaryKey(),
  hostProfileId: int("hostProfileId").notNull(),
  specialtyId: int("specialtyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const dishwasherFoodPreferences = mysqlTable("dishwasherFoodPreferences", {
  id: int("id").autoincrement().primaryKey(),
  dishwasherProfileId: int("dishwasherProfileId").notNull(),
  specialtyId: int("specialtyId").notNull(),
  preferenceLevel: mysqlEnum("preferenceLevel", ["love", "like", "neutral"]).default("like").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const profilePhotos = mysqlTable("profilePhotos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  hostId: int("hostId").notNull(),
  dishwasherId: int("dishwasherId"),
  status: mysqlEnum("status", ["open", "matched", "confirmed", "in_progress", "completed", "cancelled"]).default("open").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  estimatedDurationMinutes: int("estimatedDurationMinutes").default(60).notNull(),
  actualDurationMinutes: int("actualDurationMinutes"),
  dishCount: int("dishCount"),
  mealDescription: text("mealDescription"),
  specialInstructions: text("specialInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const sessionPhotos = mysqlTable("sessionPhotos", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(),
  caption: text("caption"),
  displayOrder: int("displayOrder").default(0).notNull(),
  moderationStatus: varchar("moderationStatus", { length: 20 }).default("approved").notNull(),
  flagCount: int("flagCount").default(0).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const photoFlags = mysqlTable("photoFlags", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(),
  reporterId: int("reporterId").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  raterId: int("raterId").notNull(),
  ratedId: int("ratedId").notNull(),
  rating: int("rating").notNull(), // 1-5
  reviewText: text("reviewText"),
  punctualityRating: int("punctualityRating"), // 1-5
  qualityRating: int("qualityRating"), // 1-5
  friendlinessRating: int("friendlinessRating"), // 1-5
  wouldRecommend: boolean("wouldRecommend").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  dishwasherId: int("dishwasherId").notNull(),
  matchScore: int("matchScore"), // Store as integer (score * 100)
  status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data"),
  relatedId: int("relatedId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  messageText: text("messageText").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Authentication tables
export const oauthAccounts = mysqlTable("oauthAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // google, facebook, github
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const emailVerifications = mysqlTable("emailVerifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const passwordResets = mysqlTable("passwordResets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const refreshTokens = mysqlTable("refreshTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const loginAttempts = mysqlTable("loginAttempts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  successful: boolean("successful").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DishwasherProfile = typeof dishwasherProfiles.$inferSelect;
export type InsertDishwasherProfile = typeof dishwasherProfiles.$inferInsert;
export type HostProfile = typeof hostProfiles.$inferSelect;
export type InsertHostProfile = typeof hostProfiles.$inferInsert;
export type Allergy = typeof allergies.$inferSelect;
export type InsertAllergy = typeof allergies.$inferInsert;
export type UserAllergy = typeof userAllergies.$inferSelect;
export type InsertUserAllergy = typeof userAllergies.$inferInsert;
export type FoodSpecialty = typeof foodSpecialties.$inferSelect;
export type InsertFoodSpecialty = typeof foodSpecialties.$inferInsert;
export type HostFoodSpecialty = typeof hostFoodSpecialties.$inferSelect;
export type InsertHostFoodSpecialty = typeof hostFoodSpecialties.$inferInsert;
export type DishwasherFoodPreference = typeof dishwasherFoodPreferences.$inferSelect;
export type InsertDishwasherFoodPreference = typeof dishwasherFoodPreferences.$inferInsert;
export type ProfilePhoto = typeof profilePhotos.$inferSelect;
export type InsertProfilePhoto = typeof profilePhotos.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOAuthAccount = typeof oauthAccounts.$inferInsert;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;
