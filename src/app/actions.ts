"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/session";
import { addClient, logActivity, moveStatus, updateContent } from "@/lib/store";
import type { Item } from "@/lib/types";

export async function login(_: unknown, form: FormData) {
  const sb = await authClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  });
  if (error) return { error: "Wrong email or password." };
  redirect("/");
}

export async function logout() {
  const sb = await authClient();
  await sb.auth.signOut();
  redirect("/login");
}

type Result = { ok: true; message?: string } | { ok: false; error: string };

export async function saveRelease(
  id: string,
  fields: { title: string; version: string; summary: string; items: Item[] },
): Promise<Result> {
  const u = await requireUser();
  try {
    const { reopened } = await updateContent(id, fields, u.name);
    revalidatePath(`/releases/${id}`);
    revalidatePath("/");
    return { ok: true, message: reopened ? "Saved. Approval was cleared, so it's back in review." : "Saved." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const RULES = {
  submit: { from: "draft", to: "in_review", manager: false, log: "Submitted for review" },
  approve: { from: "in_review", to: "approved", manager: true, log: "Approved" },
  request_changes: { from: "in_review", to: "draft", manager: true, log: "Requested changes – back to draft" },
  mark_sent: { from: "approved", to: "sent", manager: true, log: "Marked as sent to client" },
} as const;

export async function transition(id: string, action: keyof typeof RULES): Promise<Result> {
  const u = await requireUser();
  const rule = RULES[action];
  if (rule.manager && u.role !== "manager") return { ok: false, error: "Only a manager can do this." };
  const now = new Date().toISOString();
  const extra =
    action === "approve" ? { approved_by: u.name, approved_at: now }
    : action === "mark_sent" ? { sent_at: now }
    : action === "request_changes" ? { approved_by: null, approved_at: null }
    : {};
  // Conditional update: succeeds only if the release is still in the expected status.
  const moved = await moveStatus(id, rule.from, rule.to, extra);
  if (!moved) return { ok: false, error: "This release changed in the meantime. Refresh and try again." };
  await logActivity(id, u.name, rule.log);
  revalidatePath(`/releases/${id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function createClientAction(_: unknown, form: FormData) {
  const u = await requireUser();
  if (u.role !== "manager") return { error: "Only a manager can add clients." };
  const name = String(form.get("name") || "").trim();
  if (!name) return { error: "Name is required." };
  try {
    await addClient(name, String(form.get("contact_email") || "").trim() || null);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/clients");
  return { ok: true };
}
