import { renderTemplate } from "../../render.ts";
import { getSession } from "../../services/session-service.ts";

const handleGetLogin = async (req: Request) => {
  const session = getSession(req);
  if(session) {
    return new Response(null, {status: 302, headers: { Location: '/' } })
  }
  return await renderTemplate('login', {});
}

export default handleGetLogin;
