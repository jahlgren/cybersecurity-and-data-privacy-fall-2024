import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { renderTemplate } from "../../render.ts";
import { login } from "../../services/auth-service.ts";
import { RequestContext } from "../../shared-types.ts";

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
});

const handlePostlogin = async ({request, session, remoteAddress}: RequestContext) => {
  const formData = await request.formData();

  const csrfToken = formData.get('csrfToken') as string||'';
  const email = formData.get('email') as string||'';
  const password = formData.get('password') as string||'';;

  if(csrfToken !== session.csrfToken) {
    return await renderTemplate('login', {email, error: 'Invalid CSRF token', csrfToken: session.csrfToken}, 400);
  }

  try {

    schema.parse({ email, password });

    const user = await login(email, password, remoteAddress.hostname);
    
    if(!user) {
      return await renderTemplate('login', {email, error: 'Invalid email or password', csrfToken: session.csrfToken}, 400);
    }

    // Successfulk login..
    session.user = { username: user.username, token: user.userToken, role: user.role, birthdate: user.birthdate };
    session.refreshCsrfToken();

    const response = new Response(null, {status: 302, headers: { Location: '/' } });
    return response;

  } catch (error) {

    if (error instanceof z.ZodError) {
      return await renderTemplate('login', {email, error: 'Invalid email or password', csrfToken: session.csrfToken}, 400);
    }
    
    console.error(error);

    return new Response('Error during registration', { status: 500 });

  }
}

export default handlePostlogin;
