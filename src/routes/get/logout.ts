import { getCookies, setCookie } from "https://deno.land/std@0.224.0/http/cookie.ts";
import { destroySession } from "../../services/session-service.ts";

const handleGetLogout = async (req: Request) => {
  const cookies = getCookies(req.headers);
  const sessionId = cookies['sessionId'];
  destroySession(sessionId);

  const response = new Response(null, {status: 302, headers: { Location: '/' } });
  setCookie(response.headers, {
    name: 'sessionId',
    value: '',
    maxAge: 0
  });
  return response;
}

export default handleGetLogout;
