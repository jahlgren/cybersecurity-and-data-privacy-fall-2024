import { getAllResources } from "../../../services/resource-service.ts";
import { RequestContext } from "../../../shared-types.ts";

const handleApiGetResource = async ({session}: RequestContext) => {

  if(!session || !session.user) {
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 401, headers: {'Content-Type': 'application/json'} });
  }

  try {
    const resources = await getAllResources();
    return new Response(JSON.stringify(resources), { status: 200, headers: {'Content-Type': 'application/json'} });
  }
  catch (e) {
    console.log(e);
    return new Response(JSON.stringify({error: 'Something went wrong..'}), { status: 500 });
  }

}

export default handleApiGetResource;
