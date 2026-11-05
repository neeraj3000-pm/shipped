import "server-only";
import { redirect } from "next/navigation";
import { authClient } from "./supabase/server";
import { admin } from "./supabase/admin";
import type { Profile } from "./types";

export async function currentUser(): Promise<Profile | null> {
  const sb = await authClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await admin().from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: p?.name ?? data.user.email ?? "User",
    role: (p?.role as Profile["role"]) ?? "member",
  };
}

export async function requireUser(): Promise<Profile> {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}
