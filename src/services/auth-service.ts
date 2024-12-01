import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
import client from "../db/client.ts";
import { getUserByUsername, User } from "./user-service.ts";

export const login = async (username: string, password: string, ipAddress: string): Promise<User|null> => {
  const user = await getUserByUsername(username);

  if(!user) {
    return null;
  }
  
  const validPassword = await bcrypt.compare(password, user.passwordHash||'');
  if (!validPassword) {
    return null;
  }

  await logLogin(user.userToken, ipAddress);
  return user;
}

export const logLogin = async (userToken: string, ipAddress: string) => {
  try {
    await client.queryArray(`INSERT INTO cbkapp_login_logs (user_token, ip_address) VALUES ($1, $2)`, [userToken, ipAddress]);
  } catch (error) {
    console.error("Error logging login event:", error);
  }
}
