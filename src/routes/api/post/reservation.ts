import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';
import { RequestContext } from "../../../shared-types.ts";
import { createReservation, isResourceReserved } from "../../../services/reservation-service.ts";

const schema = z.object({
  resourceId: z.number({required_error: 'Resource id required'}),
  from: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, { message: 'Invalid start date' }),
  to: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, { message: 'Invalid end date' }),
  reserverBirthDate: z.string({required_error: 'Invalid birthdate'}).refine((date) => {
    const birthDate = new Date(date);
    if (isNaN(birthDate.getTime())) {
      return false;
    }
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear = 
      today.getMonth() > birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  
    return hasHadBirthdayThisYear ? age >= 15 : age > 15;
  }, { message: 'You must be at least 15 years old to book a resource' })
}).refine(
  (data) => {
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    return toDate > fromDate;
  },
  {
    message: "End date later than start date",
    path: ["to"],
  }
);

export function sanitizeHtmlOutput(value: string) {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const handleApiPostReservation = async ({request, session}: RequestContext) => {

  if(!session || !session.user) {
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 401, headers: {'Content-Type': 'application/json'} });
  }

  const data = await request.json();
  const resourceId = Number(data.resourceId);
  const from = data.from;
  const to = data.to;
  const csrfToken = data.csrfToken;
  const reserverToken = session.user.token;
  
  if(csrfToken !== session.csrfToken) {
    return new Response(JSON.stringify({error: 'Invalid CSRF token'}), { status: 400, headers: {'Content-Type': 'application/json'} });
  }

  try {
    schema.parse({ resourceId, from, to, reserverBirthDate: session.user.birthdate.toISOString() });
    
    // Check if the resource already is reserved
    if(await isResourceReserved(resourceId, new Date(from), new Date(to))) {
      return new Response(JSON.stringify({error: 'The resource is not available between the given dates'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }
    
    const reservation = await createReservation(reserverToken, resourceId, new Date(from), new Date(to));
    if(!reservation) {
      return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }
    return new Response(JSON.stringify(reservation), { status: 200, headers: {'Content-Type': 'application/json'} });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => sanitizeHtmlOutput(e.message)).join(", ");
      return new Response(JSON.stringify({error: message}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }
    return new Response(JSON.stringify({error: 'Internal Server Error'}), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}

export default handleApiPostReservation;
