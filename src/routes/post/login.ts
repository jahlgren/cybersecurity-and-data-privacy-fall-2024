import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { setCookie } from "https://deno.land/std@0.224.0/http/cookie.ts";
import { renderTemplate } from "../../render.ts";
import { login } from "../../services/auth-service.ts";

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
});

const handlePostlogin = async (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => {
  const formData = await req.formData();

  const email = formData.get('email') as string||'';
  const password = formData.get('password') as string||'';;

  try {

    schema.parse({ email, password });

    const cookie = await login(email, password, info.remoteAddr.hostname);
    
    if(!cookie) {
      return await renderTemplate('login', {email, error: 'Invalid email or password'}, 400);
    }

    // Successfulk login..
    const response = new Response(null, {status: 302, headers: { Location: '/' } });
    setCookie(response.headers, cookie);
    return response;

  } catch (error) {

    if (error instanceof z.ZodError) {
      return await renderTemplate('login', {email, error: 'Invalid email or password'}, 400);
    }
    
    console.error(error);

    return new Response('Error during registration', { status: 500 });

  }
}

export default handlePostlogin;
