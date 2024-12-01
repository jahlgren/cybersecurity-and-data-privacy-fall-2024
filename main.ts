import * as path from "jsr:@std/path";
import handleGetRegister from "./src/routes/get/register.ts";
import handlePostRegister from "./src/routes/post/register.ts";
import handleGetLogin from "./src/routes/get/login.ts";
import handlePostlogin from "./src/routes/post/login.ts";
import handleGetIndex from "./src/routes/get/index.ts";
import handleGetLogout from "./src/routes/get/logout.ts";

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

const ROUTES: {[method: string]: {[routeName: string]: (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) => Promise<Response>}} = {
  GET: {
    '/register': handleGetRegister,
    '/login': handleGetLogin,
    '/logout': handleGetLogout,
    '/': handleGetIndex,
  },
  POST: {
    '/register': handlePostRegister,
    '/login': handlePostlogin
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

  return await handler(req, info);
}

Deno.serve({ port: PORT }, middleware(handler));
