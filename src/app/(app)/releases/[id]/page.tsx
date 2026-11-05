import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getActivity, getRelease } from "@/lib/store";
import { appUrl } from "@/lib/format";
import { Editor } from "./Editor";

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, release, activity] = await Promise.all([requireUser(), getRelease(id), getActivity(id)]);
  if (!release) notFound();
  return (
    <Editor
      release={release}
      activity={activity}
      role={user.role}
      portalUrl={`${appUrl()}/portal/${release.clients?.portal_token}`}
    />
  );
}
