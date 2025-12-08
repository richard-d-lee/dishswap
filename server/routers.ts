import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { filterByDistance } from "./geolocation";
import { calculateUserBadges } from "./badges";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return Math.random().toString(36).substring(2, 15);
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    updateProfile: protectedProcedure
      .input(z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        bio: z.string().optional(),
        dateOfBirth: z.date().optional(),
        userType: z.enum(["dishwasher", "host", "both"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUser(ctx.user.id, input);
      }),
    
    uploadPhoto: protectedProcedure
      .input(z.object({
        photoData: z.string(), // base64 encoded
        isPrimary: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.photoData, 'base64');
        const fileKey = `users/${ctx.user.id}/photos/${randomSuffix()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");
        
        await db.addProfilePhoto({
          userId: ctx.user.id,
          photoUrl: url,
          isPrimary: input.isPrimary || false,
          displayOrder: 0,
        });
        
        if (input.isPrimary) {
          await db.updateUser(ctx.user.id, { profilePhotoUrl: url });
        }
        
        return { url };
      }),
    
    getPhotos: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPhotos(ctx.user.id);
    }),
    
    deletePhoto: protectedProcedure
      .input(z.object({ photoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteProfilePhoto(input.photoId, ctx.user.id);
      }),
  }),

  dishwasher: router({
    createProfile: protectedProcedure
      .input(z.object({
        workRangeKm: z.number().default(10),
        experienceYears: z.number().default(0),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDishwasherProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getDishwasherProfileByUserId(ctx.user.id);
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        workRangeKm: z.number().optional(),
        experienceYears: z.number().optional(),
        isAvailable: z.boolean().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        availabilitySchedule: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateDishwasherProfile(ctx.user.id, input);
      }),
    
    search: publicProcedure
      .input(z.object({
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        maxDistance: z.number().optional(),
        isAvailable: z.boolean().optional(),
        minRating: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.searchDishwashers(input);
      }),
  }),

  host: router({
    createProfile: protectedProcedure
      .input(z.object({
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        typicalDishCount: z.number().default(0),
        kitchenSize: z.enum(["small", "medium", "large"]).default("medium"),
        hasDishwasherMachine: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createHostProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getHostProfileByUserId(ctx.user.id);
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        typicalDishCount: z.number().optional(),
        kitchenSize: z.enum(["small", "medium", "large"]).optional(),
        hasDishwasherMachine: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateHostProfile(ctx.user.id, input);
      }),
  }),

  allergies: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllAllergies();
    }),
    
    getUserAllergies: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAllergies(ctx.user.id);
    }),
    
    add: protectedProcedure
      .input(z.object({
        allergyId: z.number(),
        severity: z.enum(["mild", "moderate", "severe"]).default("moderate"),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addUserAllergy({
          userId: ctx.user.id,
          allergyId: input.allergyId,
          severity: input.severity,
        });
      }),
    
    remove: protectedProcedure
      .input(z.object({ allergyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.removeUserAllergy(ctx.user.id, input.allergyId);
      }),
  }),

  specialties: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllFoodSpecialties();
    }),
    
    getHostSpecialties: protectedProcedure.query(async ({ ctx }) => {
      const hostProfile = await db.getHostProfileByUserId(ctx.user.id);
      if (!hostProfile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Host profile not found" });
      }
      return db.getHostSpecialties(hostProfile.id);
    }),
    
    addHostSpecialty: protectedProcedure
      .input(z.object({ specialtyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const hostProfile = await db.getHostProfileByUserId(ctx.user.id);
        if (!hostProfile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Host profile not found" });
        }
        return db.addHostSpecialty(hostProfile.id, input.specialtyId);
      }),
    
    removeHostSpecialty: protectedProcedure
      .input(z.object({ specialtyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const hostProfile = await db.getHostProfileByUserId(ctx.user.id);
        if (!hostProfile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Host profile not found" });
        }
        return db.removeHostSpecialty(hostProfile.id, input.specialtyId);
      }),
    
    getDishwasherPreferences: protectedProcedure.query(async ({ ctx }) => {
      const dishwasherProfile = await db.getDishwasherProfileByUserId(ctx.user.id);
      if (!dishwasherProfile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dishwasher profile not found" });
      }
      return db.getDishwasherPreferences(dishwasherProfile.id);
    }),
    
    addDishwasherPreference: protectedProcedure
      .input(z.object({
        specialtyId: z.number(),
        preferenceLevel: z.enum(["love", "like", "neutral"]).default("like"),
      }))
      .mutation(async ({ ctx, input }) => {
        const dishwasherProfile = await db.getDishwasherProfileByUserId(ctx.user.id);
        if (!dishwasherProfile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Dishwasher profile not found" });
        }
        return db.addDishwasherPreference(dishwasherProfile.id, input.specialtyId, input.preferenceLevel);
      }),
    
    removeDishwasherPreference: protectedProcedure
      .input(z.object({ specialtyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dishwasherProfile = await db.getDishwasherProfileByUserId(ctx.user.id);
        if (!dishwasherProfile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Dishwasher profile not found" });
        }
        return db.removeDishwasherPreference(dishwasherProfile.id, input.specialtyId);
      }),
  }),

  sessions: router({
    uploadPhoto: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        photoData: z.string(), // base64 encoded
        caption: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user is host or dishwasher of this session
        const session = await db.getSessionById(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        if (session.hostId !== ctx.user.id && session.dishwasherId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to upload photos for this session' });
        }

        const buffer = Buffer.from(input.photoData, 'base64');
        const fileKey = `sessions/${input.sessionId}/photos/${randomSuffix()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        await db.createSessionPhoto({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          photoUrl: url,
          caption: input.caption,
        });

        return { success: true, photoUrl: url };
      }),

    getPhotos: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionPhotos(input.sessionId);
      }),

    flagPhoto: protectedProcedure
      .input(z.object({
        photoId: z.number(),
        reason: z.enum(["inappropriate", "spam", "violence", "copyright", "other"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.flagPhoto({
          photoId: input.photoId,
          reporterId: ctx.user.id,
          reason: input.reason,
          description: input.description,
        });
      }),

    create: protectedProcedure
      .input(z.object({
        scheduledDate: z.date(),
        estimatedDurationMinutes: z.number().default(60),
        dishCount: z.number().optional(),
        mealDescription: z.string().optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createSession({
          hostId: ctx.user.id,
          ...input,
        });
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionById(input.id);
      }),
    
    getMyHostSessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getSessionsByHostId(ctx.user.id);
    }),
    
    getMyDishwasherSessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getSessionsByDishwasherId(ctx.user.id);
    }),
    
    getOpen: publicProcedure.query(async () => {
      return db.getOpenSessions();
    }),
    
    searchByLocation: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(25),
      }))
      .query(async ({ input }) => {
        const sessions = await db.getOpenSessions();
        
        // Get host profiles with location data
        const sessionsWithLocation = await Promise.all(
          sessions.map(async (session) => {
            const hostProfile = await db.getHostProfileByUserId(session.hostId);
            return {
              ...session,
              latitude: hostProfile?.latitude ? parseFloat(hostProfile.latitude) : null,
              longitude: hostProfile?.longitude ? parseFloat(hostProfile.longitude) : null,
            };
          })
        );
        
        // Filter sessions by distance
        const sessionsWithDistance = filterByDistance(
          sessionsWithLocation,
          { latitude: input.latitude, longitude: input.longitude },
          input.radiusKm
        );
        
        return sessionsWithDistance;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "matched", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
        dishwasherId: z.number().optional(),
        actualDurationMinutes: z.number().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.id);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
        }
        if (session.hostId !== ctx.user.id && session.dishwasherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        
        const { id, ...updateData } = input;
        return db.updateSession(id, updateData);
      }),
    
    applyForSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.sessionId);
        
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.status !== 'open') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session is not open for applications' });
        }
        
        if (session.hostId === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot apply to your own session' });
        }
        
        // Update session to matched status and assign dishwasher
        await db.updateSession(input.sessionId, {
          dishwasherId: ctx.user.id,
          status: 'matched',
        });
        
        // Create notification for host
        await db.createNotification({
          userId: session.hostId,
          title: 'New Application',
          message: `${ctx.user.name || 'Someone'} applied for your dishwashing session`,
          type: 'session_application',
          relatedId: input.sessionId,
        });
        
        return { success: true };
      }),

    confirmSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.sessionId);
        
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        if (session.hostId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only host can confirm session' });
        }
        
        if (session.status !== 'matched') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Session must be in matched status' });
        }
        
        await db.updateSession(input.sessionId, {
          status: 'confirmed',
        });
        
        // Notify dishwasher
        if (session.dishwasherId) {
          await db.createNotification({
            userId: session.dishwasherId,
            title: 'Session Confirmed',
            message: 'Your dishwashing session has been confirmed!',
            type: 'session_confirmed',
            relatedId: input.sessionId,
          });
        }
        
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        status: z.enum(['in_progress', 'completed', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.sessionId);
        
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        
        // Verify user is host or dishwasher
        if (session.hostId !== ctx.user.id && session.dishwasherId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to update this session' });
        }
        
        const updates: any = { status: input.status };
        
        if (input.status === 'completed') {
          updates.completedAt = new Date();
        }
        
        await db.updateSession(input.sessionId, updates);
        
        // Notify other party
        const notifyUserId = session.hostId === ctx.user.id ? session.dishwasherId : session.hostId;
        if (notifyUserId) {
          await db.createNotification({
            userId: notifyUserId,
            title: 'Session Updated',
            message: `Session status changed to ${input.status}`,
            type: 'session_update',
            relatedId: input.sessionId,
          });
        }
        
        return { success: true };
      }),

    getMySessions: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserSessions(ctx.user.id);
      }),
    
    findMatches: protectedProcedure
      .input(z.object({
        maxDistance: z.number().optional(),
        minRating: z.number().min(1).max(5).optional(),
        cuisineType: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Get user's dishwasher profile for preferences
        const dishwasherProfile = await db.getDishwasherProfileByUserId(ctx.user.id);
        
        if (!dishwasherProfile) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Dishwasher profile required to find matches' 
          });
        }
        
        // Get all open sessions
        let sessions = await db.getOpenSessions();
        
        // Filter by date range if provided
        if (input.dateFrom || input.dateTo) {
          sessions = sessions.filter(session => {
            const sessionDate = new Date(session.scheduledDate);
            if (input.dateFrom && sessionDate < input.dateFrom) return false;
            if (input.dateTo && sessionDate > input.dateTo) return false;
            return true;
          });
        }
        
        // Filter by cuisine type if provided
        if (input.cuisineType) {
          sessions = sessions.filter(session => 
            session.mealDescription?.toLowerCase().includes(input.cuisineType!.toLowerCase())
          );
        }
        
        // TODO: Implement distance filtering using location data
        // This requires geospatial queries with latitude/longitude
        
        // TODO: Filter by host rating if minRating provided
        // This requires joining with host profiles and ratings
        
        return sessions;
      }),
  }),

  notifications: router({    getMyNotifications: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserNotifications(ctx.user.id);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.markNotificationAsRead(input.notificationId);
      }),
    
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.markAllNotificationsAsRead(ctx.user.id);
      }),
  }),

  matches: router({
    create: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        dishwasherId: z.number(),
        matchScore: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMatch(input);
      }),
    
    getBySession: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesBySessionId(input.sessionId);
      }),
    
    getMyMatches: protectedProcedure.query(async ({ ctx }) => {
      return db.getMatchesByDishwasherId(ctx.user.id);
    }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        status: z.enum(["pending", "accepted", "declined", "expired"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateMatchStatus(input.matchId, input.status);
        
        // If accepted, update the session
        if (input.status === "accepted") {
          const matches = await db.getMatchesBySessionId(input.matchId);
          const match = matches.find(m => m.match.id === input.matchId);
          if (match) {
            await db.updateSession(match.match.sessionId, {
              dishwasherId: ctx.user.id,
              status: "matched",
            });
            
            // Create notification for host
            const session = await db.getSessionById(match.match.sessionId);
            if (session) {
              await db.createNotification({
                userId: session.hostId,
                type: "match_accepted",
                title: "Match Accepted!",
                message: `A dishwasher has accepted your session request.`,
                data: { sessionId: session.id },
              });
            }
          }
        }
        
        return { success: true };
      }),
  }),

  profiles: router({
    getPublicProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        
        // Get profile based on user type
        const hostProfile = await db.getHostProfileByUserId(input.userId);
        const dishwasherProfile = await db.getDishwasherProfileByUserId(input.userId);
        
        // Get statistics
        const hostSessions = await db.getSessionsByHostId(input.userId);
        const dishwasherSessions = await db.getSessionsByDishwasherId(input.userId);
        const ratings = await db.getRatingsByUserId(input.userId);
        
        // Calculate average rating
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, r) => sum + r.rating.rating, 0) / ratings.length
          : 0;
        
        // Calculate account age in days
        const accountAge = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate badges
        const badges = calculateUserBadges({
          totalHostSessions: hostSessions.length,
          totalDishwasherSessions: dishwasherSessions.length,
          completedHostSessions: hostSessions.filter(s => s.status === 'completed').length,
          completedDishwasherSessions: dishwasherSessions.filter(s => s.status === 'completed').length,
          totalRatings: ratings.length,
          averageRating: avgRating,
          isEmailVerified: user.emailVerified,
          accountAge,
        });
        
        return {
          user: {
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            bio: user.bio,
            createdAt: user.createdAt,
          },
          hostProfile,
          dishwasherProfile,
          statistics: {
            totalHostSessions: hostSessions.length,
            totalDishwasherSessions: dishwasherSessions.length,
            completedHostSessions: hostSessions.filter(s => s.status === 'completed').length,
            completedDishwasherSessions: dishwasherSessions.filter(s => s.status === 'completed').length,
            totalRatings: ratings.length,
            averageRating: avgRating,
          },
          badges,
          recentSessions: hostSessions
            .filter(s => s.status === 'completed')
            .sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() - new Date(a.completedAt || a.scheduledDate).getTime())
            .slice(0, 6),
          reviews: ratings.slice(0, 10),
          sessionPhotos: await db.getUserSessionPhotos(input.userId),
        };
      }),
    
    getProfilePhotos: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        // Get photos from completed sessions
        const sessions = await db.getSessionsByHostId(input.userId);
        const photos: string[] = [];
        
        // Photos will come from session photos when that feature is added
        // For now return empty array
        
        return photos.slice(0, 20); // Return up to 20 photos
      }),
  }),
  
  ratings: router({
    create: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        ratedId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        punctualityRating: z.number().min(1).max(5).optional(),
        qualityRating: z.number().min(1).max(5).optional(),
        friendlinessRating: z.number().min(1).max(5).optional(),
        wouldRecommend: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if already rated
        const existing = await db.getRatingBySessionAndRater(input.sessionId, ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Already rated this session" });
        }
        
        return db.createRating({
          ...input,
          raterId: ctx.user.id,
        });
      }),
    
    getByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getRatingsByUserId(input.userId);
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        receiverId: z.number(),
        messageText: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createMessage({
          ...input,
          senderId: ctx.user.id,
        });
        
        // Create notification for receiver
        await db.createNotification({
          userId: input.receiverId,
          type: "new_message",
          title: "New Message",
          message: `You have a new message from ${ctx.user.name || 'a user'}`,
          data: { sessionId: input.sessionId },
        });
        
        return result;
      }),
    
    getBySession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionMessages(input.sessionId);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        return db.markMessageAsRead(input.messageId);
      }),
    
    getConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getConversation(ctx.user.id, input.otherUserId);
      }),
    
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserConversations(ctx.user.id);
      }),
  }),

  admin: router({
    getFlaggedPhotos: protectedProcedure
      .query(async ({ ctx }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return db.getFlaggedPhotos();
      }),

    moderatePhoto: protectedProcedure
      .input(z.object({
        photoId: z.number(),
        action: z.enum(["approve", "reject"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return db.moderatePhoto(input.photoId, input.action, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
