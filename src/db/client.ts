import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
  hostname: Deno.env.get('DB_HOSTNAME'),
  port: Deno.env.get('DB_PORT'),
  database: Deno.env.get('DB_NAME'),
  user: Deno.env.get('DB_USER'),
  password: Deno.env.get('DB_PASSWORD')
});

await client.connect();

export default client;
