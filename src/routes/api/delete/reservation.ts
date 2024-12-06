import { RequestContext } from "../../../shared-types.ts";
import { deleteReservationById, getReservationById } from "../../../services/reservation-service.ts";

const handleApiDeleteReservation = async ({request, session}: RequestContext) => {

  if(!session || !session.user) {
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 401, headers: {'Content-Type': 'application/json'} });
  }
  
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  const csrfToken = request.headers.get('CSRF-Token');

  if(csrfToken !== session.csrfToken) {
    return new Response(JSON.stringify({error: 'Invalid CSRF token'}), { status: 400, headers: {'Content-Type': 'application/json'} });
  }

  if(!Number.isNaN(id) && typeof id !== 'number') {
    return new Response(JSON.stringify({error: 'Invalid id'}), { status: 400, headers: {'Content-Type': 'application/json'} });
  }

  try {
    const reservation = await getReservationById(id);
    if(!reservation) {
      return new Response(JSON.stringify({error: 'A reservation with the given id does not exist'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    }

    if(session.user.role !== 'administrator' && reservation.reserver !== session.user.username) {
      return new Response(JSON.stringify({error: 'Premission denied'}), { status: 401, headers: {'Content-Type': 'application/json'} });
    }

    const result = await deleteReservationById(id);
    if(!result)
      return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 400, headers: {'Content-Type': 'application/json'} });
    return new Response(JSON.stringify({id}), { status: 200, headers: {'Content-Type': 'application/json'} });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}

export default handleApiDeleteReservation;
