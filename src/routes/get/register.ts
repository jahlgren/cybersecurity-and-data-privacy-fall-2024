import { renderTemplate } from "../../render.ts";

const handleGetRegister = async () => {
  return await renderTemplate('register', {});
}

export default handleGetRegister;
