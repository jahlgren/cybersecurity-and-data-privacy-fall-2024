import { getCookies } from "https://deno.land/std@0.224.0/http/cookie.ts";

const SESSION_EXPIRATION_TIME = 60 * 60 * 1000; // 1h

export type SessionData = {
  csrfToken: string,
  createdAt: number,
  expiresAt: number,
  user?: {
    token: string,
    username: string,
    birthdate: Date,
    role: 'reserver'|'administrator'
  }
  refresh: () => void,
  refreshCsrfToken: () => void
}

// // In-memory session store (replace with a database in production)
const sessionStore = new Map<string, SessionData>();

const createSession = (): string => {
  const sessionId = crypto.randomUUID();
  const sessionData: SessionData = {
    csrfToken: crypto.randomUUID(),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRATION_TIME,
    refresh: function() { 
      this.expiresAt = Date.now() + SESSION_EXPIRATION_TIME;
    },
    refreshCsrfToken: function() {
      this.csrfToken = crypto.randomUUID()
    }
  }
  sessionStore.set(sessionId, sessionData);
  return sessionId;
}

export const getSession = (req: Request) => {
  const cookies = getCookies(req.headers);
  let sessionId = cookies['sessionId'];
  let isNewSession = false;

  if(!sessionId || !sessionStore.has(sessionId)) {
    sessionId = createSession();
    isNewSession = true;
  }

  const session = sessionStore.get(sessionId)!;
  if(session.expiresAt < Date.now()) {
    destroySession(sessionId);
    sessionId = createSession();
    isNewSession = true;
  }

  session.refresh();
  return {session, sessionId, isNewSession};
}

export function destroySession(sessionId: string) {
  if(!sessionId)
    return;
  sessionStore.delete(sessionId);
}

// import { getCookies } from "https://deno.land/std@0.224.0/http/cookie.ts";
// import { User } from "./user-service.ts";

// export type SessionData = {
//   username: string,
//   role: 'reserver'|'administrator',
//   createdAt: number
// };

// const SESSION_EXPIRATION_TIME = 60 * 60 * 1000;

// // In-memory session store (replace with a database in production)
// const sessionStore = new Map<string, SessionData>();

// export function createSession(user: User): string {
//   const sessionId = crypto.randomUUID();
//   const sessionData = {
//       username: user.username,
//       role: user.role,
//       createdAt: Date.now(),
//   };
//   sessionStore.set(sessionId, sessionData);
//   return sessionId;
// }

// export function getSession(req: Request) {
//   const cookies = getCookies(req.headers);
//   const sessionId = cookies['sessionId'];

//   if (!sessionId) 
//     return null;

//   const sessionData = sessionStore.get(sessionId);
//   if (sessionData && Date.now() - sessionData.createdAt < SESSION_EXPIRATION_TIME) {
//     return sessionData;
//   }

//   sessionStore.delete(sessionId);
//   return null;
// }

// export function destroySession(sessionId: string) {
//   if (sessionId) {
//     sessionStore.delete(sessionId);
//   }
// }
