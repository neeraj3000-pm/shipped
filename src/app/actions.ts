"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/session";
import { addClient, getRelease, logActivity, setStatus, updateContent } from "@/lib/store";
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

export async function transition(id: string, action: "submit" | "approve" | "request_changes" | "mark_sent"): Promise<Result> {
  const u = await requireUser();
  const r = await getRelease(id);
  if (!r) return { ok: false, error: "Release not found." };
  const manager = u.role === "manager";
  const now = new Date().toISOString();

  if (action === "submit") {
    if (r.status !== "draft") return { ok: false, error: "Only drafts can be submitted." };
    await setStatus(id, "in_review", u.name);
    await logActivity(id, u.name, "Submitted for review");
  } else if (action === "approve") {
    if (!manager) return { ok: false, error: "Only a manager can approve." };
    if (r.status !== "in_review") return { ok: false, error: "Only releases in review can be approved." };
    await setStatus(id, "approved", u.name, { approved_by: u.name, approved_at: now });
    await logActivity(id, u.name, "Approved");
  } else if (action === "request_changes") {
    if (!manager) return { ok: false, error: "Only a manager can request changes." };
    if (r.status !== "in_review") return { ok: false, error: "Only releases in review can be sent back." };
    await setStatus(id, "draft", u.name);
    await logActivity(id, u.name, "Requested changes – back to draft");
  } else if (action === "mark_sent") {
    if (!manager) return { ok: false, error: "Only a manager can mark a release as sent." };
    if (r.status !== "approved") return { ok: false, error: "Only approved releases can be marked as sent." };
    await setStatus(id, "sent", u.name, { sent_at: now });
    await logActivity(id, u.name, "Marked as sent to client");
  }
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
