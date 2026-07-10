function getKey(params) {
  const raw = params.path;
  return (Array.isArray(raw) ? raw.join("/") : String(raw || "")).replace(/^\/+/, "");
}

export async function onRequestGet(context) {
  if (!context.env.MEDIA) {
    return new Response("Armazenamento de mídia não configurado.", { status: 503 });
  }
  const key = getKey(context.params);
  if (!/^uploads\/[a-zA-Z0-9/_\-.]+$/.test(key)) {
    return new Response("Arquivo inválido.", { status: 400 });
  }

  const object = await context.env.MEDIA.get(key);
  if (!object) return new Response("Imagem não encontrada.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
