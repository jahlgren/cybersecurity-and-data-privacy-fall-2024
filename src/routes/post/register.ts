import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { createUser, UsernameNotAvailableError } from "../../services/user-service.ts";
import { renderFile, renderTemplate } from "../../render.ts";
import { RequestContext } from "../../shared-types.ts";

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

const handlePostRegister = async ({request}: RequestContext) => {
  const formData = await request.formData();

  const email = formData.get('email') as string||'';
  const birthdate = formData.get('birthdate') as string||'';;
  const password = formData.get('password') as string||'';;
  const confirmPassword = formData.get('confirmPassword') as string||'';;
  const role = formData.get('role') as string||'';;

  try {

    schema.parse({ email, password, confirmPassword, birthdate, role });
    await createUser(email, password, birthdate, role);
    return await renderFile('register-success.html');

  } catch (error) {

    let message = '';
    if (error instanceof z.ZodError) {
      message = `Validation Error: ${error.errors.map(e => sanitizeHtmlOutput(e.message)).join(", ")}`;
    }
    if(error instanceof UsernameNotAvailableError) {
      message = error.message;
    }
    
    console.error(error);
    
    if(message.length > 0) {
      return await renderTemplate('register-failed', {message});
    }

    return new Response('Error during registration', { status: 500 });

  }
}

export default handlePostRegister;
