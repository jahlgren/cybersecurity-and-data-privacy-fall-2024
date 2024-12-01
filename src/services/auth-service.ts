import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
import client from "../db/client.ts";
import { getUserByUsername } from "./user-service.ts";
import { createSession } from "./session-service.ts";
import { Cookie } from "https://deno.land/std@0.224.0/http/cookie.ts";

export const login = async (username: string, password: string, ipAddress: string): Promise<Cookie|null> => {
  const user = await getUserByUsername(username);

  if(!user) {
    return null;
  }
  
  const validPassword = await bcrypt.compare(password, user.passwordHash||'');
  if (!validPassword) {
    return null;
  }

  await logLogin(user.userToken, ipAddress);
  const sessionId = createSession(user);
  return {
    name: 'sessionId',
    value: sessionId,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/'
  };
}

export const logLogin = async (userToken: string, ipAddress: string) => {
  try {
    await client.queryArray(`INSERT INTO cbkapp_login_logs (user_token, ip_address) VALUES ($1, $2)`, [userToken, ipAddress]);
  } catch (error) {
    console.error("Error logging login event:", error);
  }
}
