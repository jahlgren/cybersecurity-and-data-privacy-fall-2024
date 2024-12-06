import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { RequestContext } from "../../../shared-types.ts";
import { createResource, getResourceByName } from "../../../services/resource-service.ts";

const schema = z.object({
  name: z.string().min(1)
});

export function sanitizeHtmlOutput(value: string) {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const handleApiPostResource = async ({request, session}: RequestContext) => {

  if(!session || !session.user || session.user.role !== 'administrator') {
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 401, headers: {'Content-Type': 'application/json'} });
  }

  const data = await request.json();
  const {name, description, csrfToken} = data;

  if(csrfToken !== session.csrfToken) {
    return new Response(JSON.stringify({error: 'Invalid CSRF token'}), { status: 400, headers: {'Content-Type': 'application/json'} });
  }

  try {
    schema.parse({ name });

    const row = await getResourceByName(name);
    if(row) {
      return new Response(JSON.stringify({error: 'A resource with that name already exists'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }

    const resource = await createResource(name as string, (description as string)||'');
    if(!resource) {
      return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }
    return new Response(JSON.stringify(resource), { status: 201, headers: {'Content-Type': 'application/json'} });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      const message = `Validation Error: ${error.errors.map(e => sanitizeHtmlOutput(e.message)).join(", ")}`;
      return new Response(JSON.stringify({error: message}), { status: 400, headers: {'Content-Type': 'application/json'} });
    } 
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}

export default handleApiPostResource;
