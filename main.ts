import { Context, Hono } from '@hono/hono';
import { serveStatic } from '@hono/hono/deno';
import postRegister from './src/routes/postRegister.ts'

const app = new Hono();

app.use((c, next) => {
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('X-Frame-Options', 'DENY');
  c.header('Content-Security-Policy', `default-src 'self'; script-src 'self'; script-src-elem 'self'; style-src 'self'; style-src-elem 'self'; img-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; font-src 'self'; media-src 'self'; object-src 'self'; manifest-src 'self'; worker-src 'self'; form-action 'self';`);
  
  return next();
});

app.use('/*', serveStatic({ root: './public' }));

app.get('/register', async (c: Context) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

app.post('/api/register', postRegister);

Deno.serve(app.fetch);
