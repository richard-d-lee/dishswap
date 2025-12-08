// Socket.IO client hook for real-time features
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Initialize socket connection
    // Note: Token is sent via cookie, no need to pass explicitly
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket.IO] Connection error:", error.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

// Hook for conversation-specific socket events
export function useConversationSocket(conversationId: number | null) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<unknown[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit("join:conversation", conversationId);

    // Listen for new messages
    const handleNewMessage = (message: unknown) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for typing indicators
    const handleUserTyping = (data: { userId: number }) => {
      setTypingUsers((prev) => new Set(prev).add(data.userId));
    };

    const handleUserStoppedTyping = (data: { userId: number }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.emit("leave:conversation", conversationId);
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleUserTyping);
      socket.off("user:stopped-typing", handleUserStoppedTyping);
    };
  }, [socket, conversationId]);

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!socket || !conversationId) return;
    socket.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
  };

  return {
    isConnected,
    messages,
    typingUsers: Array.from(typingUsers),
    sendTypingIndicator,
  };
}

// Hook for notifications
export function useNotifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<unknown[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: unknown) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  return {
    isConnected,
    notifications,
  };
}
