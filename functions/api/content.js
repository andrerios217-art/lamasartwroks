import { getSiteContent } from "../_lib/content.js";
import { json, methodNotAllowed } from "../_lib/responses.js";

export async function onRequestGet(context) {
  try {
    const content = await getSiteContent(context.env);
    return json(content, {
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível carregar o conteúdo do site." }, { status: 500 });
  }
}


export const onRequestPost = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;
