import { renderFile } from "../../render.ts";

const handleGetRegister = async () => {
  return await renderFile('register.html');
}

export default handleGetRegister;
