import { json, methodNotAllowed } from "../../_lib/responses.js";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function onRequestPost(context) {
  try {
    if (!context.env.MEDIA) {
      return json({ error: "Binding R2 MEDIA não configurado." }, { status: 503 });
    }

    const form = await context.request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Selecione uma imagem." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return json({ error: "Formato não permitido. Use JPG, PNG, WebP ou GIF." }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return json({ error: "A imagem deve ter no máximo 10 MB." }, { status: 413 });
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const extension = ALLOWED_TYPES.get(file.type);
    const key = `uploads/${year}/${month}/${crypto.randomUUID()}.${extension}`;

    await context.env.MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable"
      },
      customMetadata: {
        uploadedBy: context.data.accessUser?.email || "unknown",
        originalName: String(file.name || "image").slice(0, 180)
      }
    });

    return json({
      ok: true,
      key,
      url: `/media/${key}`,
      type: file.type,
      size: file.size
    }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível enviar a imagem." }, { status: 500 });
  }
}


export const onRequestGet = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;
