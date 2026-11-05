import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { DEMO_PROMPT, SAMPLE_TICKETS } from "@/lib/demo";

export default async function ConnectPage() {
  await requireUser();
  const url = `${appUrl()}/api/mcp/${process.env.MCP_WORKSPACE_TOKEN}`;
  const steps = [
    { t: "Open connectors", d: "In claude.ai, go to Settings → Connectors and click “Add custom connector”." },
    { t: "Paste the link", d: "Name it “Shipped” and paste the connector URL below. No login is needed; the link itself is the key." },
    { t: "Turn it on", d: "In a new chat, open the tools menu and make sure Shipped is enabled." },
    { t: "Ask for a draft", d: "Paste your sprint tickets and name the clients. Claude writes one draft per client and links you back here." },
  ];
  return (
    <div className="max-w-3xl">
      <h1 className="headline text-4xl text-ink">Connect Claude</h1>
      <p className="mt-2 text-slate-600">
        Shipped has no AI inside. Your own Claude does the writing through this connector, and Shipped handles review, approval and delivery.
      </p>

      <div className="card mt-8 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Connector URL (MCP, Streamable HTTP)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-canvas px-3 py-2 text-sm text-navy">{url}</code>
          <CopyButton text={url} label="Copy URL" />
        </div>
        <p className="mt-2 text-xs text-slate-400">Treat this like a password: anyone with it can create drafts in this workspace. Claude can never approve or send.</p>
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={i} className="card p-5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-sm font-bold text-ice">{i + 1}</span>
            <p className="mt-3 font-bold text-navy">{s.t}</p>
            <p className="mt-1 text-sm text-slate-600">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="card mt-8 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-navy">Try it: sample sprint tickets and prompt</p>
          <CopyButton text={`${DEMO_PROMPT}\n\n${SAMPLE_TICKETS}`} label="Copy prompt + tickets" />
        </div>
        <p className="mt-3 text-sm text-slate-700">{DEMO_PROMPT}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-navy p-4 text-xs leading-relaxed text-ice">{SAMPLE_TICKETS}</pre>
      </div>

      <div className="card mt-8 p-5">
        <p className="font-bold text-navy">What Claude can do</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li><code className="text-brand">list_clients</code>, <code className="text-brand">add_client</code>: see and add clients</li>
          <li><code className="text-brand">create_release_draft</code>: one draft per client, grouped into New / Improved / Fixed / Known issues</li>
          <li><code className="text-brand">list_releases</code>, <code className="text-brand">get_release</code>, <code className="text-brand">update_release</code>: read and revise drafts</li>
          <li className="font-medium text-slate-800">Approval and sending are human-only, in this app.</li>
        </ul>
      </div>
    </div>
  );
}
