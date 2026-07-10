export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function methodNotAllowed() {
  return json({ error: "Método não permitido." }, { status: 405, headers: { Allow: "GET, PUT, POST, DELETE" } });
}
