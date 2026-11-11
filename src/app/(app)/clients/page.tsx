import { listClients, listReleases } from "@/lib/store";
import { requireUser } from "@/lib/session";
import { appUrl, relTime } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { AddClientForm } from "./AddClientForm";
import { ExternalLink } from "lucide-react";

export default async function ClientsPage() {
  const [user, clients, releases] = await Promise.all([requireUser(), listClients(), listReleases()]);
  return (
    <div>
      <h1 className="headline text-3xl text-fg sm:text-4xl">Clients</h1>
      <p className="mt-2 text-muted">Each client gets one private, read-only link with their approved release history.</p>

      {user.role === "manager" && <AddClientForm />}

      <div className="mt-6 grid gap-4">
        {clients.length === 0 && (
          <div className="card px-6 py-12 text-center text-muted">No clients yet. Add one above, or Claude will create one when it drafts a release.</div>
        )}
        {clients.map((c) => {
          const url = `${appUrl()}/portal/${c.portal_token}`;
          const mine = releases.filter((r) => r.client_id === c.id);
          const last = mine.find((r) => r.status === "sent");
          return (
            <div key={c.id} style={{ ["--i" as string]: clients.indexOf(c) }} className="animate-in lift card flex flex-wrap items-center gap-4 p-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-sky/15 text-lg font-extrabold text-sky ring-1 ring-sky/30">{c.name[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-fg">{c.name}</p>
                <p className="text-sm text-muted">
                  {c.contact_email || "No contact email"} · {mine.length} release{mine.length === 1 ? "" : "s"}
                  {last ? ` · last sent v${last.version} ${relTime(last.sent_at ?? last.updated_at)}` : ""}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <code className="hidden max-w-[260px] truncate rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs text-muted lg:block">{url}</code>
                <CopyButton text={url} label="Copy portal link" />
                <a href={url} target="_blank" className="btn btn-ghost !px-3 !py-1.5 text-sm"><ExternalLink size={14} /> Open</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
