import { Context } from "@hono/hono";
import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
import client from "../db.ts";

const ERROR_LOGIN_MESSAGE = 'Invalid username and/or password.';

const loginSchema = z.object({
  username: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
});

async function getUserRow(username: string) {
  const result = await client.queryArray(`SELECT username, password_hash, user_token, role FROM cbkapp_users WHERE username = $1`, [username]);
  return result.rows.length === 1 ? result.rows[0] : null;
}

export default async function postLogin(c: Context) {
  const { username, password } = await c.req.parseBody()

  if(typeof username !== 'string' || typeof password !== 'string') {
    return c.html(ERROR_LOGIN_MESSAGE, 400);
  }

  try {
    loginSchema.parse({ username, password });
    
    const user = await getUserRow(username);

    if(!user) {
      return c.html(ERROR_LOGIN_MESSAGE, 400);
    }


    console.log(user);
    // const passwordMatches = await bcrypt.compare(password, storedPasswordHash);
    // if (!passwordMatches) {
    //     return new Response("Invalid email or password", { status: 400 });
    // }



  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.html(ERROR_LOGIN_MESSAGE, 400);
    }
    console.error(error);
    return c.html('Error during login', 500);
  }
}
