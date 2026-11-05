import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { authClient } from "./supabase/server";
import { admin } from "./supabase/admin";
import type { Profile } from "./types";

/**
 * Verifies the session JWT locally (ES256 via cached JWKS), so no network round trip.
 * Name and role live in app_metadata (settable only with the service role), so they
 * can't be forged by the user. Falls back to the profiles table for older tokens.
 * Wrapped in cache() so layout + page share one lookup per request.
 */
export const currentUser = cache(async (): Promise<Profile | null> => {
  const sb = await authClient();
  const { data } = await sb.auth.getClaims();
  const c = data?.claims;
  if (!c?.sub) return null;
  const meta = (c.app_metadata ?? {}) as { name?: string; role?: Profile["role"] };
  if (meta.name && meta.role) return { id: c.sub, email: (c.email as string) ?? "", name: meta.name, role: meta.role };
  const { data: p } = await admin().from("profiles").select("*").eq("id", c.sub).maybeSingle();
  return {
    id: c.sub,
    email: (c.email as string) ?? "",
    name: p?.name ?? (c.email as string) ?? "User",
    role: (p?.role as Profile["role"]) ?? "member",
  };
});

export async function requireUser(): Promise<Profile> {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}
