import { Context, Hono } from '@hono/hono';
import { serveStatic } from '@hono/hono/deno';

const app = new Hono();

app.use('/*', serveStatic({ root: './public' }));

app.get('/register', async (c: Context) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

Deno.serve(app.fetch);
