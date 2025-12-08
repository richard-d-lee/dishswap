// Socket.IO server for real-time features
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { verifyToken } from "../auth/utils";
import { logger } from "./logger";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL || "https://yourdomain.com"
        : "*",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    // Get token from cookie or auth header
    const cookies = socket.handshake.headers.cookie;
    let token = socket.handshake.auth.token;
    
    // Parse cookie if no auth token provided
    if (!token && cookies) {
      const cookieMatch = cookies.match(/dishswap_session=([^;]+)/);
      if (cookieMatch) {
        token = cookieMatch[1];
      }
    }
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error("Authentication error: Invalid token"));
      }
      
      // Attach user info to socket
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      socket.data.role = payload.role;
      
      next();
    } catch (error) {
      logger.error("Socket authentication error", error as Error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    logger.info("User connected via Socket.IO", { userId, socketId: socket.id });

    // Join user's personal room for targeted messages
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on("join:conversation", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug("User joined conversation", { userId, conversationId });
    });

    // Handle leaving conversation rooms
    socket.on("leave:conversation", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
      logger.debug("User left conversation", { userId, conversationId });
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { conversationId: number }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user:typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("typing:stop", (data: { conversationId: number }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user:stopped-typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info("User disconnected from Socket.IO", { userId, socketId: socket.id });
    });
  });

  logger.info("Socket.IO server initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
}

// Helper functions to emit events

export function emitToUser(userId: number, event: string, data: unknown) {
  try {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    logger.error("Failed to emit to user", error as Error, { userId, event });
  }
}

export function emitToConversation(conversationId: number, event: string, data: unknown) {
  try {
    const socketIO = getIO();
    socketIO.to(`conversation:${conversationId}`).emit(event, data);
  } catch (error) {
    logger.error("Failed to emit to conversation", error as Error, { conversationId, event });
  }
}

export function emitNewMessage(conversationId: number, message: unknown) {
  emitToConversation(conversationId, "message:new", message);
}

export function emitNewNotification(userId: number, notification: unknown) {
  emitToUser(userId, "notification:new", notification);
}

export function emitSessionUpdate(sessionId: number, update: Record<string, unknown>) {
  try {
    const socketIO = getIO();
    socketIO.emit("session:update", { sessionId, ...update });
  } catch (error) {
    logger.error("Failed to emit session update", error as Error, { sessionId });
  }
}
