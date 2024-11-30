import * as path from "jsr:@std/path";
import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";

const SCRIPT_DIR = new URL(".", import.meta.url).pathname.substring(1);
const VIEWS_DIR = path.join(SCRIPT_DIR, '/views');

const renderer = new Eta({ views: VIEWS_DIR });

export const renderTemplate = async (path: string, data: object, statusCode: number = 200) => {
  const html = await renderer.renderAsync(path, data);
  return new Response(html, {status: statusCode, headers: {'Content-Type': 'text/html'}});
}

export const renderFile = async (file: string, statusCode: number = 200) => {
  const html = await Deno.readFile('./src/views/' + file);
  return new Response(html, {status: statusCode, headers: {'Content-Type': 'text/html'}});
}

export default renderer;
