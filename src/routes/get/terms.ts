import { renderTemplate } from "../../render.ts";

const handleGetTermsOfService = async () => {
  return await renderTemplate('terms', {});
}

export default handleGetTermsOfService;
