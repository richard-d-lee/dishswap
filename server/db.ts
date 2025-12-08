import { eq, and, sql, desc, asc, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  dishwasherProfiles, InsertDishwasherProfile, DishwasherProfile,
  hostProfiles, InsertHostProfile, HostProfile,
  allergies, userAllergies, InsertUserAllergy,
  foodSpecialties, hostFoodSpecialties, dishwasherFoodPreferences,
  profilePhotos, InsertProfilePhoto,
  sessions, InsertSession, Session,
  sessionPhotos,
  photoFlags,
  ratings, InsertRating,
  matches, InsertMatch,
  notifications, InsertNotification,
  messages, InsertMessage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Management =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "firstName", "lastName", "phone", "profilePhotoUrl", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (user.userType !== undefined) {
      values.userType = user.userType;
      updateSet.userType = user.userType;
    }
    if (user.dateOfBirth !== undefined) {
      values.dateOfBirth = user.dateOfBirth;
      updateSet.dateOfBirth = user.dateOfBirth;
    }
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
    }
    if (user.isActive !== undefined) {
      values.isActive = user.isActive;
      updateSet.isActive = user.isActive;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}

// ============= Dishwasher Profiles =============

export async function createDishwasherProfile(data: InsertDishwasherProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dishwasherProfiles).values(data);
  return result;
}

export async function getDishwasherProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dishwasherProfiles).where(eq(dishwasherProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDishwasherProfile(userId: number, data: Partial<InsertDishwasherProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(dishwasherProfiles).set(data).where(eq(dishwasherProfiles.userId, userId));
  return getDishwasherProfileByUserId(userId);
}

export async function searchDishwashers(filters: {
  latitude?: string;
  longitude?: string;
  maxDistance?: number;
  isAvailable?: boolean;
  minRating?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    profile: dishwasherProfiles,
    user: users
  }).from(dishwasherProfiles)
    .leftJoin(users, eq(dishwasherProfiles.userId, users.id));
  
  // Note: For production, implement proper geospatial queries
  // This is a simplified version
  const results = await query;
  return results;
}

// ============= Host Profiles =============

export async function createHostProfile(data: InsertHostProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hostProfiles).values(data);
  return result;
}

export async function getHostProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hostProfiles).where(eq(hostProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateHostProfile(userId: number, data: Partial<InsertHostProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hostProfiles).set(data).where(eq(hostProfiles.userId, userId));
  return getHostProfileByUserId(userId);
}

// ============= Allergies =============

export async function getAllAllergies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(allergies);
}

export async function getUserAllergies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    userAllergy: userAllergies,
    allergy: allergies
  }).from(userAllergies)
    .leftJoin(allergies, eq(userAllergies.allergyId, allergies.id))
    .where(eq(userAllergies.userId, userId));
}

export async function addUserAllergy(data: InsertUserAllergy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userAllergies).values(data);
}

export async function removeUserAllergy(userId: number, allergyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(userAllergies).where(
    and(eq(userAllergies.userId, userId), eq(userAllergies.allergyId, allergyId))
  );
}

// ============= Food Specialties =============

export async function getAllFoodSpecialties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(foodSpecialties);
}

export async function getHostSpecialties(hostProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    hostSpecialty: hostFoodSpecialties,
    specialty: foodSpecialties
  }).from(hostFoodSpecialties)
    .leftJoin(foodSpecialties, eq(hostFoodSpecialties.specialtyId, foodSpecialties.id))
    .where(eq(hostFoodSpecialties.hostProfileId, hostProfileId));
}

export async function addHostSpecialty(hostProfileId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(hostFoodSpecialties).values({ hostProfileId, specialtyId });
}

export async function removeHostSpecialty(hostProfileId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(hostFoodSpecialties).where(
    and(eq(hostFoodSpecialties.hostProfileId, hostProfileId), eq(hostFoodSpecialties.specialtyId, specialtyId))
  );
}

export async function getDishwasherPreferences(dishwasherProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    preference: dishwasherFoodPreferences,
    specialty: foodSpecialties
  }).from(dishwasherFoodPreferences)
    .leftJoin(foodSpecialties, eq(dishwasherFoodPreferences.specialtyId, foodSpecialties.id))
    .where(eq(dishwasherFoodPreferences.dishwasherProfileId, dishwasherProfileId));
}

export async function addDishwasherPreference(dishwasherProfileId: number, specialtyId: number, preferenceLevel: "love" | "like" | "neutral") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dishwasherFoodPreferences).values({ dishwasherProfileId, specialtyId, preferenceLevel });
}

export async function removeDishwasherPreference(dishwasherProfileId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(dishwasherFoodPreferences).where(
    and(eq(dishwasherFoodPreferences.dishwasherProfileId, dishwasherProfileId), eq(dishwasherFoodPreferences.specialtyId, specialtyId))
  );
}

// ============= Profile Photos =============

export async function getUserPhotos(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profilePhotos)
    .where(eq(profilePhotos.userId, userId))
    .orderBy(desc(profilePhotos.isPrimary), asc(profilePhotos.displayOrder));
}

export async function addProfilePhoto(data: InsertProfilePhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(profilePhotos).values(data);
}

export async function deleteProfilePhoto(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(profilePhotos).where(
    and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId))
  );
}

export async function setPrimaryPhoto(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, unset all primary photos for this user
  await db.update(profilePhotos)
    .set({ isPrimary: false })
    .where(eq(profilePhotos.userId, userId));
  
  // Then set the new primary
  await db.update(profilePhotos)
    .set({ isPrimary: true })
    .where(and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId)));
}

// ============= Sessions =============

export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(data);
  const insertId = Number(result[0]?.insertId || 0);
  if (insertId) {
    return await getSessionById(insertId);
  }
  return result;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSessionsByHostId(hostId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions)
    .where(eq(sessions.hostId, hostId))
    .orderBy(desc(sessions.scheduledDate));
}

export async function getSessionsByDishwasherId(dishwasherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions)
    .where(eq(sessions.dishwasherId, dishwasherId))
    .orderBy(desc(sessions.scheduledDate));
}

export async function getOpenSessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions)
    .where(eq(sessions.status, "open"))
    .orderBy(asc(sessions.scheduledDate));
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set(data).where(eq(sessions.id, id));
  return getSessionById(id);
}

// ============= Session Photos =============

export async function createSessionPhoto(data: { sessionId: number; userId: number; photoUrl: string; caption?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessionPhotos).values(data);
  return { id: Number(result[0]?.insertId || 0) };
}

export async function getSessionPhotos(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionPhotos)
    .where(eq(sessionPhotos.sessionId, sessionId))
    .orderBy(asc(sessionPhotos.displayOrder), desc(sessionPhotos.uploadedAt));
}

export async function getUserSessionPhotos(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionPhotos)
    .where(and(
      eq(sessionPhotos.userId, userId),
      eq(sessionPhotos.isHidden, false)
    ))
    .orderBy(desc(sessionPhotos.uploadedAt));
}

// ============= Photo Moderation =============

export async function flagPhoto(data: { photoId: number; reporterId: number; reason: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already flagged this photo
  const existing = await db.select().from(photoFlags)
    .where(and(
      eq(photoFlags.photoId, data.photoId),
      eq(photoFlags.reporterId, data.reporterId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("You have already flagged this photo");
  }
  
  // Create flag
  await db.insert(photoFlags).values(data);
  
  // Increment flag count on photo
  await db.update(sessionPhotos)
    .set({ flagCount: sql`${sessionPhotos.flagCount} + 1` })
    .where(eq(sessionPhotos.id, data.photoId));
  
  // Auto-hide if flagged 3+ times
  const photo = await db.select().from(sessionPhotos)
    .where(eq(sessionPhotos.id, data.photoId))
    .limit(1);
  
  if (photo[0] && photo[0].flagCount >= 3) {
    await db.update(sessionPhotos)
      .set({ isHidden: true, moderationStatus: "under_review" })
      .where(eq(sessionPhotos.id, data.photoId));
  }
  
  return { success: true };
}

export async function getFlaggedPhotos() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    flag: photoFlags,
    photo: sessionPhotos,
    reporter: users,
  })
  .from(photoFlags)
  .innerJoin(sessionPhotos, eq(photoFlags.photoId, sessionPhotos.id))
  .innerJoin(users, eq(photoFlags.reporterId, users.id))
  .where(eq(photoFlags.status, "pending"))
  .orderBy(desc(photoFlags.createdAt));
}

export async function moderatePhoto(photoId: number, action: "approve" | "reject", moderatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (action === "approve") {
    await db.update(sessionPhotos)
      .set({ isHidden: false, moderationStatus: "approved", flagCount: 0 })
      .where(eq(sessionPhotos.id, photoId));
  } else {
    await db.update(sessionPhotos)
      .set({ isHidden: true, moderationStatus: "rejected" })
      .where(eq(sessionPhotos.id, photoId));
  }
  
  // Update all flags for this photo
  await db.update(photoFlags)
    .set({ 
      status: action === "approve" ? "dismissed" : "confirmed",
      reviewedBy: moderatorId,
      reviewedAt: sql`NOW()`
    })
    .where(eq(photoFlags.photoId, photoId));
  
  return { success: true };
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions)
    .where(
      or(
        eq(sessions.hostId, userId),
        eq(sessions.dishwasherId, userId)
      )
    )
    .orderBy(desc(sessions.scheduledDate));
}

// ============= Matches =============

export async function createMatch(data: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(matches).values(data);
}

export async function getMatchesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    match: matches,
    dishwasher: users,
    dishwasherProfile: dishwasherProfiles
  }).from(matches)
    .leftJoin(users, eq(matches.dishwasherId, users.id))
    .leftJoin(dishwasherProfiles, eq(matches.dishwasherId, dishwasherProfiles.userId))
    .where(eq(matches.sessionId, sessionId))
    .orderBy(desc(matches.matchScore));
}

export async function getMatchesByDishwasherId(dishwasherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    match: matches,
    session: sessions
  }).from(matches)
    .leftJoin(sessions, eq(matches.sessionId, sessions.id))
    .where(eq(matches.dishwasherId, dishwasherId))
    .orderBy(desc(matches.createdAt));
}

export async function updateMatchStatus(matchId: number, status: "pending" | "accepted" | "declined" | "expired") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(matches)
    .set({ status, respondedAt: new Date() })
    .where(eq(matches.id, matchId));
}

// ============= Ratings =============

export async function createRating(data: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ratings).values(data);
  
  // Update average ratings
  await updateAverageRatings(data.ratedId);
  
  return result;
}

export async function getRatingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    rating: ratings,
    rater: users
  }).from(ratings)
    .leftJoin(users, eq(ratings.raterId, users.id))
    .where(eq(ratings.ratedId, userId))
    .orderBy(desc(ratings.createdAt));
}

export async function getRatingBySessionAndRater(sessionId: number, raterId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ratings)
    .where(and(eq(ratings.sessionId, sessionId), eq(ratings.raterId, raterId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

async function updateAverageRatings(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const userRatings = await db.select().from(ratings).where(eq(ratings.ratedId, userId));
  
  if (userRatings.length === 0) return;
  
  const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
  const avgRatingInt = Math.round(avgRating * 100); // Store as integer
  
  const user = await getUserById(userId);
  if (!user) return;
  
  // Update dishwasher profile if exists
  const dishwasherProfile = await getDishwasherProfileByUserId(userId);
  if (dishwasherProfile) {
    await db.update(dishwasherProfiles)
      .set({ averageRating: avgRatingInt, totalRatings: userRatings.length })
      .where(eq(dishwasherProfiles.userId, userId));
  }
  
  // Update host profile if exists
  const hostProfile = await getHostProfileByUserId(userId);
  if (hostProfile) {
    await db.update(hostProfiles)
      .set({ averageRating: avgRatingInt, totalRatings: userRatings.length })
      .where(eq(hostProfiles.userId, userId));
  }
}

// ============= Notifications =============

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ============= Messages =============

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(messages).values(data);
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    message: messages,
    sender: users
  }).from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt));
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, messageId));
}


export async function getConversation(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    message: messages,
    sender: users
  }).from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    )
    .orderBy(asc(messages.createdAt));
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all messages where user is sender or receiver
  const allMessages = await db.select({
    message: messages,
    sender: users,
  }).from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));
  
  // Group by conversation partner and get the most recent message
  const conversationMap = new Map();
  for (const row of allMessages) {
    const msg = row.message;
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        lastMessage: msg,
        sender: row.sender,
      });
    }
  }
  
  return Array.from(conversationMap.values());
}
