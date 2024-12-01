import { renderTemplate } from "../../render.ts";
import { RequestContext } from "../../shared-types.ts";

const handleGetIndex = async ({session}: RequestContext) => {
  return await renderTemplate('index', {
    user: session && session.user ? { username: session.user.username } : undefined
  });
}

export default handleGetIndex;
