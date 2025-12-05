import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Mobile OAuth Endpoints', () => {
  const baseUrl = 'http://localhost:3000/api/auth';

  it('should reject Google mobile auth without ID token', async () => {
    const response = await fetch(`${baseUrl}/google/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('ID token is required');
  });

  it('should reject Facebook mobile auth without access token', async () => {
    const response = await fetch(`${baseUrl}/facebook/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Access token is required');
  });

  it('should reject invalid Google ID token', async () => {
    const response = await fetch(`${baseUrl}/google/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'invalid_token_12345' }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Authentication failed');
  });

  it('should reject invalid Facebook access token', async () => {
    const response = await fetch(`${baseUrl}/facebook/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: 'invalid_token_12345' }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid Facebook token');
  });
});
