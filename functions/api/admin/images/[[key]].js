import { json, methodNotAllowed } from "../../../_lib/responses.js";

function getKey(params) {
  const raw = params.key;
  const key = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  return key.replace(/^\/+/, "");
}

export async function onRequestDelete(context) {
  if (!context.env.MEDIA) {
    return json({ error: "Binding R2 MEDIA não configurado." }, { status: 503 });
  }
  const key = getKey(context.params);
  if (!/^uploads\/[a-zA-Z0-9/_\-.]+$/.test(key)) {
    return json({ error: "Caminho de imagem inválido." }, { status: 400 });
  }
  await context.env.MEDIA.delete(key);
  return json({ ok: true }, { headers: { "cache-control": "no-store" } });
}


export const onRequestGet = methodNotAllowed;
export const onRequestPost = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
