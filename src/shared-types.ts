import { SessionData } from "./services/session-service.ts";

export type RequestContext = {
  request: Request,
  remoteAddress: Deno.NetAddr,
  session: SessionData
}
