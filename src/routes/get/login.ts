import { renderTemplate } from "../../render.ts";
import { RequestContext } from "../../shared-types.ts";

const handleGetLogin = async ({session}: RequestContext) => {
  if(session.user) {
    return new Response(null, {status: 302, headers: { Location: '/' } })
  }
  return await renderTemplate('login', { csrfToken: session.csrfToken });
}

export default handleGetLogin;
