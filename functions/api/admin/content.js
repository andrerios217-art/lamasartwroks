import { getSiteContent, saveSiteContent } from "../../_lib/content.js";
import { json, methodNotAllowed } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  try {
    const content = await getSiteContent(context.env);
    return json({ content, user: context.data.accessUser || null }, {
      headers: { "cache-control": "no-store" }
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível abrir o conteúdo administrativo." }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const length = Number(context.request.headers.get("content-length") || 0);
    if (length > 1_000_000) {
      return json({ error: "Conteúdo muito grande." }, { status: 413 });
    }
    const input = await context.request.json();
    const content = await saveSiteContent(context.env, input);
    return json({ ok: true, content, updatedAt: new Date().toISOString() }, {
      headers: { "cache-control": "no-store" }
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível salvar as alterações." }, { status: 400 });
  }
}


export const onRequestPost = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;
