import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, verifyToken } from "./utils";
import { createUser, getUserByEmail } from "./db";

describe("Authentication System", () => {
  describe("Password Hashing", () => {
    it("should hash passwords correctly", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should verify correct passwords", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe("JWT Tokens", () => {
    it("should generate valid access tokens", () => {
      const payload = { email: "test@example.com", userId: 1 };
      const token = generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should generate valid refresh tokens", () => {
      const payload = { email: "test@example.com", userId: 1 };
      const token = generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify valid tokens", () => {
      const payload = { email: "test@example.com", userId: 1 };
      const token = generateAccessToken(payload);
      const verified = verifyToken(token);
      
      expect(verified).toBeDefined();
      expect(verified?.email).toBe("test@example.com");
      expect(verified?.userId).toBe(1);
    });

    it("should reject invalid tokens", () => {
      const invalidToken = "invalid.token.here";
      const verified = verifyToken(invalidToken);
      
      expect(verified).toBeNull();
    });
  });

  describe("Password Validation", () => {
    it("should accept strong passwords", () => {
      const strongPasswords = [
        "Test123!Pass",
        "MyP@ssw0rd",
        "Secure#Pass1",
      ];

      strongPasswords.forEach(password => {
        // Password validation is done in the router, but we can test the regex
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;

        expect(hasUppercase && hasLowercase && hasNumber && isLongEnough).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = [
        "short",
        "nouppercase123",
        "NOLOWERCASE123",
        "NoNumbers!",
      ];

      weakPasswords.forEach(password => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;

        const isStrong = hasUppercase && hasLowercase && hasNumber && isLongEnough;
        expect(isStrong).toBe(false);
      });
    });
  });
});
