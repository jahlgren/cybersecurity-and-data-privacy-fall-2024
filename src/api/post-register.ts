import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { createUser, getUserByUsername, UsernameNotAvailableError } from "../services/user-service.ts";

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).max(50, 'Email must not exceed 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  birthdate: z.string().refine((date) => {
      const birthDateObj = new Date(date);
      return !isNaN(birthDateObj.getTime());
  }, { message: 'Invalid birthdate' }),
  role: z.enum(['reserver', 'administrator']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'The given passwords do not match',
  path: ['confirmPassword']
});

export function sanitizeHtmlOutput(value: string) {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const postRegister = async (req: Request) => {
  const formData = await req.formData();

  const email = formData.get('email') as string||'';
  const birthdate = formData.get('birthdate') as string||'';;
  const password = formData.get('password') as string||'';;
  const confirmPassword = formData.get('confirmPassword') as string||'';;
  const role = formData.get('role') as string||'';;

  try {
    schema.parse({ email, password, confirmPassword, birthdate, role });
    createUser(email, password, birthdate, role);
    new Response(`
      <!DOCTYPE html>
      <html>
        <head><title></title></head>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // return new Response(`Validation Error: ${error.errors.map(e => sanitizeHtmlOutput(e.message)).join(", ")}`, { status: 400 });
    }
    if(error instanceof UsernameNotAvailableError) {
      // return new Response(error.message, { status: 400 });
    }
    console.error(error);
    return new Response('Error during registration', { status: 500 });
  }

  return new Response([email, birthdate, password, confirmPassword, role].join(', '));
}

export default postRegister;


// import { Context } from '@hono/hono';
// import client from '../db/client.ts';
// import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
// import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
// import { sanitizeHtmlOutput } from "../utils.ts";

// const registrationSchema = z.object({
//   username: z.string().email({ message: 'Invalid email address' }).max(50, 'Email must not exceed 50 characters'),
//   password: z.string().min(8, 'Password must be at least 8 characters long'),
//   birthdate: z.string().refine((date) => {
//       const birthDateObj = new Date(date);
//       return !isNaN(birthDateObj.getTime());
//   }, { message: 'Invalid birthdate' }),
//   role: z.enum(['reserver', 'administrator']),
// });

// async function isUniqueUsername(username: string) {
//   const result = await client.queryArray(`SELECT username FROM cbkapp_users WHERE username = $1`, [username]);
//   return result.rows.length === 0;
// }

// export default async function postRegister(c: Context) {
//   const { username, password, confirmPassword, birthdate, role } = await c.req.parseBody()

//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(typeof password === 'string' ? password : '', salt);

//   if(
//     typeof username !== 'string' ||
//     typeof password !== 'string' ||
//     typeof confirmPassword !== 'string' ||
//     typeof birthdate !== 'string' ||
//     typeof role !== 'string'
//   ) {
//     return c.html('The request could not be processed.', 400);
//   }

//   if(password !== confirmPassword) {
//     return c.html('The password and confirm password did not match.', 400);
//   }

//   try {
//     registrationSchema.parse({ username, password, birthdate, role });

//     if(!(await isUniqueUsername(username))) {
//       return c.html('Username not available.', 400);
//     }

//     await client.queryArray(
//       `INSERT INTO cbkapp_users (username, password_hash, role, birthdate) VALUES ($1, $2, $3, $4)`,
//       [username, hashedPassword, role, birthdate]
//     );
//     return c.html('User registered successfully!');
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return c.html(`Validation Error: ${error.errors.map(e => sanitizeHtmlOutput(e.message)).join(", ")}`, 400);
//     }
//     console.error(error);
//     return c.html('Error during registration', 500);
//   }
// }
