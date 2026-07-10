import { verifyAccess } from "../../_lib/auth.js";

export async function onRequest(context) {
  const denied = await verifyAccess(context);
  if (denied) return denied;
  return context.next();
}
