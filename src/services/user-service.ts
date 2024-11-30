import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
import client from "../db/client.ts";

export class UsernameNotAvailableError extends Error { constructor() {super('Email not available')} }

export const getUserByUsername = async (username: string) => {
  const result = await client.queryArray(`SELECT username, password_hash, user_token, role FROM cbkapp_users WHERE username = $1`, [username]);
  if(result.rows.length !== 1)
    return null;
  const row = result.rows[0];
  return {
    username: row[0] as string,
    passwordHash: row[1] as string,
    userToken: row[2] as string,
    role: row[3] as 'reserver'|'administrator'
  }
} 

export const createUser = async (username: string, password: string, birthdate: string, role: string) => {
  if(await getUserByUsername(username))
    throw new UsernameNotAvailableError();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await client.queryArray(
    `INSERT INTO cbkapp_users (username, password_hash, role, birthdate) VALUES ($1, $2, $3, $4)`,
    [username, hashedPassword, role, birthdate]
  );
}
