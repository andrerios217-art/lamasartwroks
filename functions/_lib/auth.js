import { createRemoteJWKSet, jwtVerify } from "jose";

const jwksByIssuer = new Map();

function normalizeTeamDomain(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

export async function verifyAccess(context) {
  const teamDomain = normalizeTeamDomain(context.env.ACCESS_TEAM_DOMAIN);
  const audience = String(context.env.ACCESS_AUD || "").trim();

  if (!teamDomain || !audience) {
    return new Response("Cloudflare Access ainda não foi configurado no projeto.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const token = context.request.headers.get("cf-access-jwt-assertion");
  if (!token) {
    return new Response("Acesso administrativo não autorizado.", {
      status: 401,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const issuer = `https://${teamDomain}`;
  let jwks = jwksByIssuer.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    jwksByIssuer.set(issuer, jwks);
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience
    });
    context.data.accessUser = {
      email: typeof payload.email === "string" ? payload.email : "",
      subject: typeof payload.sub === "string" ? payload.sub : ""
    };
    return null;
  } catch (error) {
    console.error("Falha ao validar Cloudflare Access JWT", error);
    return new Response("Sessão administrativa inválida ou expirada.", {
      status: 401,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
