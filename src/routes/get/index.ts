import { renderTemplate } from "../../render.ts";
import { getSession } from "../../services/session-service.ts";

const handleGetIndex = async (req: Request) => {
  const session = getSession(req);
  return await renderTemplate('index', {
    user: session ? { username: session.username } : undefined
  });
}

export default handleGetIndex;
