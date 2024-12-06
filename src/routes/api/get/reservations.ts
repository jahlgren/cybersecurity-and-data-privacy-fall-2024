import { getAllReservations } from "../../../services/reservation-service.ts";
import { RequestContext } from "../../../shared-types.ts";

const handleApiGetReservations = async ({session}: RequestContext) => {

  try {
    const reservations = await getAllReservations();
    
    // Unauthorized users should not see who booked the resource
    if(!session.user) {
      for(let i = 0; i < reservations.length; i++)
        reservations[i].username = undefined;
    }
    // Only administrator can see username of all reservers.
    // And all other authenticated users can only see their own username.
    else if(session.user.role !== 'administrator') {
      for(let i = 0; i < reservations.length; i++) {
        if(reservations[i].username !== session.user.username) {
          reservations[i].username = undefined;
        }
      }
    }

    return new Response(JSON.stringify(reservations), { status: 200, headers: {'Content-Type': 'application/json'} });
  }
  catch (e) {
    console.log(e);
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 500 });
  }

}

export default handleApiGetReservations;
