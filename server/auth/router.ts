import { Router } from "express";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, generateRandomToken, isValidEmail, isValidPassword, getTokenExpiration, verifyToken } from "./utils";
import { createUser, updateUser, createEmailVerification, getEmailVerification, deleteEmailVerification, createPasswordReset, getPasswordReset, markPasswordResetAsUsed, createRefreshToken, getRefreshToken, deleteRefreshToken, deleteUserRefreshTokens, recordLoginAttempt, getRecentFailedAttempts } from "./db";
import { getUserByEmail } from "../db";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

const router = Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters and contain uppercase, lowercase, and numbers" 
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await createUser({
      email,
      passwordHash,
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || null,
      firstName: firstName || null,
      lastName: lastName || null,
      emailVerified: false,
      isActive: true,
    });

    // Generate verification token
    const verificationToken = generateRandomToken();
    await createEmailVerification({
      userId: newUser.id,
      token: verificationToken,
      expiresAt: getTokenExpiration(24 * 60), // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, newUser.name || undefined);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Store refresh token
    await createRefreshToken({
      userId: newUser.id,
      token: refreshToken,
      expiresAt: getTokenExpiration(7 * 24 * 60), // 7 days
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: newUser.emailVerified,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check for account lockout
    const failedAttempts = await getRecentFailedAttempts(email, LOCKOUT_DURATION_MINUTES);
    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({ 
        error: `Account temporarily locked due to too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.` 
      });
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      await recordLoginAttempt({ email, ipAddress: ipAddress || null, successful: false });
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ error: "Account is locked. Please contact support." });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated. Please contact support." });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      await recordLoginAttempt({ email, ipAddress: ipAddress || null, successful: false });
      
      // Update failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: newFailedAttempts };
      
      // Lock account if too many failed attempts
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }
      
      await updateUser(user.id, updates);
      
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Successful login - reset failed attempts
    await recordLoginAttempt({ email, ipAddress: ipAddress || null, successful: true });
    await updateUser(user.id, { 
      failedLoginAttempts: 0, 
      lockedUntil: null,
      lastSignedIn: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: getTokenExpiration(7 * 24 * 60), // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        userType: user.userType,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check if refresh token exists in database
    const storedToken = await getRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ error: "Refresh token not found or expired" });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("[Auth] Refresh token error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Get verification record
    const verification = await getEmailVerification(token);
    if (!verification) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Update user
    await updateUser(verification.userId, { emailVerified: true });

    // Delete verification token
    await deleteEmailVerification(token);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("[Auth] Email verification error:", error);
    res.status(500).json({ error: "Email verification failed" });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If the email exists, a verification link has been sent" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = generateRandomToken();
    await createEmailVerification({
      userId: user.id,
      token: verificationToken,
      expiresAt: getTokenExpiration(24 * 60), // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.name || undefined);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("[Auth] Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If the email exists, a password reset link has been sent" });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    await createPasswordReset({
      userId: user.id,
      token: resetToken,
      expiresAt: getTokenExpiration(15), // 15 minutes
      used: false,
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.name || undefined);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters and contain uppercase, lowercase, and numbers" 
      });
    }

    // Get reset record
    const reset = await getPasswordReset(token);
    if (!reset) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await updateUser(reset.userId, { passwordHash, failedLoginAttempts: 0, lockedUntil: null });

    // Mark reset token as used
    await markPasswordResetAsUsed(token);

    // Invalidate all refresh tokens for security
    await deleteUserRefreshTokens(reset.userId);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication middleware)
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await getUserByEmail(payload.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      role: user.role,
      userType: user.userType,
      profilePhotoUrl: user.profilePhotoUrl,
    });
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

export default router;
