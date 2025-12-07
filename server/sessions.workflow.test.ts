import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe("Session Workflow", () => {
  let hostContext: TrpcContext;
  let dishwasherContext: TrpcContext;
  let sessionId: number;

  beforeEach(async () => {
    // Create mock contexts for host and dishwasher
    hostContext = createMockContext(1);
    dishwasherContext = createMockContext(2);
  });

  it("should create a session successfully", async () => {
    const caller = appRouter.createCaller(hostContext);

    const result = await caller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      estimatedDurationMinutes: 60,
      dishCount: 15,
      mealDescription: "Italian dinner for 6 people",
      specialInstructions: "Please be careful with wine glasses",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.hostId).toBe(hostContext.user.id);
    expect(result.status).toBe("open");
  });

  it("should allow dishwasher to apply for open session", async () => {
    // First create a session as host
    const hostCaller = appRouter.createCaller(hostContext);
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
      dishCount: 10,
      mealDescription: "Dinner party",
    });

    const testSessionId = session.id;

    // Now apply as dishwasher
    const dishwasherCaller = appRouter.createCaller(dishwasherContext);
    const result = await dishwasherCaller.sessions.applyForSession({
      sessionId: testSessionId,
    });

    expect(result.success).toBe(true);

    // Verify session was updated
    const updatedSession = await db.getSessionById(testSessionId);
    expect(updatedSession?.status).toBe("matched");
    expect(updatedSession?.dishwasherId).toBe(dishwasherContext.user.id);
  });

  it("should not allow host to apply to their own session", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create session
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 30,
    });

    const testSessionId = session.id;

    // Try to apply to own session
    await expect(
      hostCaller.sessions.applyForSession({ sessionId: testSessionId })
    ).rejects.toThrow("Cannot apply to your own session");
  });

  it("should not allow applying to non-open session", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create and immediately update session to matched
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 30,
    });

    const testSessionId = session.id;
    
    // Update to matched status
    await db.updateSession(testSessionId, { status: "matched" });

    // Try to apply
    const dishwasherCaller = appRouter.createCaller(dishwasherContext);
    await expect(
      dishwasherCaller.sessions.applyForSession({ sessionId: testSessionId })
    ).rejects.toThrow("Session is not open for applications");
  });

  it("should allow host to confirm matched session", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create session
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
    });

    const testSessionId = session.id;

    // Apply as dishwasher
    const dishwasherCaller = appRouter.createCaller(dishwasherContext);
    await dishwasherCaller.sessions.applyForSession({ sessionId: testSessionId });

    // Confirm as host
    const result = await hostCaller.sessions.confirmSession({ sessionId: testSessionId });
    expect(result.success).toBe(true);

    // Verify session status
    const confirmedSession = await db.getSessionById(testSessionId);
    expect(confirmedSession?.status).toBe("confirmed");
  });

  it("should not allow dishwasher to confirm session", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create session
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
    });

    const testSessionId = session.id;

    // Apply as dishwasher
    const dishwasherCaller = appRouter.createCaller(dishwasherContext);
    await dishwasherCaller.sessions.applyForSession({ sessionId: testSessionId });

    // Try to confirm as dishwasher (should fail)
    await expect(
      dishwasherCaller.sessions.confirmSession({ sessionId: testSessionId })
    ).rejects.toThrow("Only host can confirm session");
  });

  it("should allow updating session status to completed", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create and set up session
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
    });

    const testSessionId = session.id;

    // Apply and confirm
    const dishwasherCaller = appRouter.createCaller(dishwasherContext);
    await dishwasherCaller.sessions.applyForSession({ sessionId: testSessionId });
    await hostCaller.sessions.confirmSession({ sessionId: testSessionId });

    // Update to completed
    const result = await hostCaller.sessions.updateStatus({
      sessionId: testSessionId,
      status: "completed",
    });

    expect(result.success).toBe(true);

    // Verify session status and completion time
    const completedSession = await db.getSessionById(testSessionId);
    expect(completedSession?.status).toBe("completed");
    expect(completedSession?.completedAt).toBeDefined();
  });

  it("should allow cancelling session", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create session
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
    });

    const testSessionId = session.id;

    // Cancel session
    const result = await hostCaller.sessions.updateStatus({
      sessionId: testSessionId,
      status: "cancelled",
    });

    expect(result.success).toBe(true);

    // Verify status
    const cancelledSession = await db.getSessionById(testSessionId);
    expect(cancelledSession?.status).toBe("cancelled");
  });

  it("should retrieve user's sessions", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    
    // Create multiple sessions
    await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 30,
      mealDescription: "Session 1",
    });

    await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 172800000),
      estimatedDurationMinutes: 45,
      mealDescription: "Session 2",
    });

    // Get user's sessions
    const sessions = await hostCaller.sessions.getMySessions();

    expect(sessions).toBeDefined();
    expect(sessions.length).toBeGreaterThanOrEqual(2);
    expect(sessions.some(s => s.mealDescription === "Session 1")).toBe(true);
    expect(sessions.some(s => s.mealDescription === "Session 2")).toBe(true);
  });

  it("should not allow unauthorized users to update session status", async () => {
    const hostCaller = appRouter.createCaller(hostContext);
    const unauthorizedContext = createMockContext(999); // Different user
    const unauthorizedCaller = appRouter.createCaller(unauthorizedContext);
    
    // Create session as host
    const session = await hostCaller.sessions.create({
      scheduledDate: new Date(Date.now() + 86400000),
      estimatedDurationMinutes: 45,
    });

    const testSessionId = session.id;

    // Try to update as unauthorized user
    await expect(
      unauthorizedCaller.sessions.updateStatus({
        sessionId: testSessionId,
        status: "cancelled",
      })
    ).rejects.toThrow("Not authorized to update this session");
  });
});
