import { renderTemplate } from "../../render.ts";
import { RequestContext } from "../../shared-types.ts";

const handleGetResources = async ({session}: RequestContext) => {
  if(!session.user || session.user.role !== 'administrator') {
    return await renderTemplate('resources-unauthorized', {
      user: session && session.user ? { username: session.user.username } : undefined
    });
  }
  return await renderTemplate('resources', {
    user: session ? { username: session.user.username } : undefined,
    csrfToken: session.csrfToken
  });
}

export default handleGetResources;
