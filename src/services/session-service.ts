import { getCookies } from "https://deno.land/std@0.224.0/http/cookie.ts";
import { User } from "./user-service.ts";

export type SessionData = {
  username: string,
  role: 'reserver'|'administrator',
  createdAt: number
};

const SESSION_EXPIRATION_TIME = 60 * 60 * 1000;

// In-memory session store (replace with a database in production)
const sessionStore = new Map<string, SessionData>();

export function createSession(user: User): string {
  const sessionId = crypto.randomUUID();
  const sessionData = {
      username: user.username,
      role: user.role,
      createdAt: Date.now(),
  };
  sessionStore.set(sessionId, sessionData);
  return sessionId;
}

export function getSession(req: Request) {
  const cookies = getCookies(req.headers);
  const sessionId = cookies['sessionId'];

  if (!sessionId) 
    return null;

  const sessionData = sessionStore.get(sessionId);
  if (sessionData && Date.now() - sessionData.createdAt < SESSION_EXPIRATION_TIME) {
    return sessionData;
  }

  sessionStore.delete(sessionId);
  return null;
}

export function destroySession(sessionId: string) {
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
}
