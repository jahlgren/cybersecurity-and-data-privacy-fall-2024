import { renderTemplate } from "../../render.ts";
import { RequestContext } from "../../shared-types.ts";

const handleGetAccountPage = async ({session}: RequestContext) => {
  if(!session.user) {
    return new Response(null, {status: 302, headers: { Location: '/' } })
  }
  return await renderTemplate('account', {
    user: { username: session.user.username, role: session.user.role }
  });
}

export default handleGetAccountPage;
