import * as path from "jsr:@std/path";
import handleGetRegister from "./src/routes/get/register.ts";
import handlePostRegister from "./src/routes/post/register.ts";
import handleGetLogin from "./src/routes/get/login.ts";
import handlePostlogin from "./src/routes/post/login.ts";
import handleGetIndex from "./src/routes/get/index.ts";
import handleGetLogout from "./src/routes/get/logout.ts";
import { RequestContext } from "./src/shared-types.ts";
import { getSession } from "./src/services/session-service.ts";
import { setCookie } from "https://deno.land/std@0.224.0/http/cookie.ts";
import handleGetResources from "./src/routes/get/resources.ts";
import handleApiPostResource from "./src/routes/api/post/resources.ts";
import handleApiGetResource from "./src/routes/api/get/resources.ts";
import handleApiDeleteResource from "./src/routes/api/delete/resource.ts";
import handleApiPostReservation from "./src/routes/api/post/reservation.ts";
import handleApiGetReservations from "./src/routes/api/get/reservations.ts";
import handleApiDeleteReservation from "./src/routes/api/delete/reservation.ts";
import handleGetPrivacyPolicy from "./src/routes/get/privacy.ts";
import handleGetTermsOfService from "./src/routes/get/terms.ts";
import handleGetAccountPage from "./src/routes/get/account.ts";

const PORT = 8000;
const SCRIPT_DIR = new URL(".", import.meta.url).pathname.substring(1);
const STATIC_DIR = path.join(SCRIPT_DIR, '/static');

const MIME_TYPES: Record<string, string> = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  json: 'application/json',
};

// const ROUTES: {[method: string]: {[routeName: string]: (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => Promise<Response>}} = {
const ROUTES: {[method: string]: {[routeName: string]: (context: RequestContext) => Promise<Response>}} = {
  GET: {
    '/': handleGetIndex,
    '/register': handleGetRegister,
    '/login': handleGetLogin,
    '/logout': handleGetLogout,
    '/resources': handleGetResources,
    '/privacy': handleGetPrivacyPolicy,
    '/terms': handleGetTermsOfService,
    '/account': handleGetAccountPage,
    
    '/api/resources': handleApiGetResource,
    '/api/reservations': handleApiGetReservations
  },
  POST: {
    '/register': handlePostRegister,
    '/login': handlePostlogin,

    '/api/resources': handleApiPostResource,
    '/api/reservations': handleApiPostReservation
  },
  DELETE: {
    '/api/resources': handleApiDeleteResource,
    '/api/reservations': handleApiDeleteReservation,
  }
}

const middleware = (handler: (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => Promise<Response>) => async (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => {
  const response = await handler(req, info);

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', [
    `default-src 'self'`,
    `script-src 'self'`,
    `style-src 'self'`,
    `img-src 'self'`,
    `connect-src 'self'`,
    `frame-src 'self'`,
    `frame-ancestors 'self'`,
    `font-src 'self'`,
    `media-src 'self'`,
    `object-src 'self'`,
    `manifest-src 'self'`,
    `worker-src 'self'`,
    `form-action 'self'`
  ].join(';'));

  return response;
}

const handler = async (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => {

  let response: Response|null;

  if((response = await serveStaticFile(req)))
    return response;
  
  if((response = await serveRoute(req, info)))
    return response;

  return new Response('Resource not found..', { status: 404 });
};

const serveStaticFile = async (req: Request): Promise<Response|null> => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const resourcePath = path.join(STATIC_DIR, pathname);
  if(!resourcePath.startsWith(STATIC_DIR))
    return null;
  try {
    const data = await Deno.readFile(resourcePath);
    const extension = (resourcePath.split(".").pop()||'').toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    return new Response(data, { headers: { 'Content-Type': contentType } });
  }
  catch {
    return null;
  }
}

const serveRoute = async (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>): Promise<Response|null> => {
  const method = req.method.toUpperCase();

  const routes = ROUTES[method];
  
  if(!routes)
    return null;
  
  const url = new URL(req.url);
  const pathname = url.pathname;
  const handler = routes[pathname];
  
  if(!handler)
    return null;

  const {session, sessionId, isNewSession} = getSession(req);

  const response = await handler({
    request: req,
    remoteAddress: info.remoteAddr,
    session
  });

  if(isNewSession) {
    setCookie(response.headers, {
      name: 'sessionId',
      value: sessionId,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      domain: 'localhost' // <- should be the fully qualified domain name..
    });
  }

  return response;
}

Deno.serve({ port: PORT }, middleware(handler));
