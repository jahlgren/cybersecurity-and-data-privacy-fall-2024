import { renderTemplate } from "../../render.ts";

const handleGetPrivacyPolicy = async () => {
  return await renderTemplate('privacy', {});
}

export default handleGetPrivacyPolicy;
