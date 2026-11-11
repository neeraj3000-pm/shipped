import { requireUser } from "@/lib/session";
import { ResetDemo } from "@/components/ResetDemo";
import { appUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { DEMO_PROMPT, SAMPLE_TICKETS } from "@/lib/demo";

export default async function ConnectPage() {
  const user = await requireUser();
  const url = `${appUrl()}/api/mcp/${process.env.MCP_WORKSPACE_TOKEN}`;
  const steps = [
    { t: "Open connectors", d: "In claude.ai, go to Settings → Connectors and click “Add custom connector”." },
    { t: "Paste the link", d: "Name it “Shipped” and paste the connector URL below. No login is needed; the link itself is the key." },
    { t: "Turn it on", d: "In a new chat, open the tools menu and make sure Shipped is enabled." },
    { t: "Ask for a draft", d: "Paste your sprint tickets and name the clients. Claude writes one draft per client and links you back here." },
  ];
  return (
    <div className="max-w-3xl">
      <h1 className="headline text-3xl text-fg sm:text-4xl">Connect Claude</h1>
      <p className="mt-2 text-muted">
        Shipped has no AI inside. Your own Claude does the writing through this connector, and Shipped handles review, approval and delivery.
      </p>

      <div className="card mt-8 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Connector URL (MCP, Streamable HTTP)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-surface-2 px-3 py-2 text-sm text-fg">{url}</code>
          <CopyButton text={url} label="Copy URL" />
        </div>
        <p className="mt-2 text-xs text-faint">Treat this like a password: anyone with it can create drafts in this workspace. Claude can never approve or send.</p>
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={i} style={{ ["--i" as string]: i }} className="animate-in card p-5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-sky text-sm font-bold text-pill">{i + 1}</span>
            <p className="mt-3 font-bold text-fg">{s.t}</p>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="card mt-8 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-fg">Try it: sample sprint tickets and prompt</p>
          <CopyButton text={`${DEMO_PROMPT}\n\n${SAMPLE_TICKETS}`} label="Copy prompt + tickets" />
        </div>
        <p className="mt-3 text-sm text-soft">{DEMO_PROMPT}</p>
        <pre className="mt-3 overflow-x-auto rounded-[20px] bg-pill p-4 text-xs leading-relaxed text-ice">{SAMPLE_TICKETS}</pre>
      </div>

      <div className="card mt-8 p-5">
        <p className="font-bold text-fg">What Claude can do</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          <li><code className="text-sky">list_clients</code>, <code className="text-sky">add_client</code>: see and add clients</li>
          <li><code className="text-sky">create_release_draft</code>: one draft per client, grouped into New / Improved / Fixed / Known issues</li>
          <li><code className="text-sky">list_releases</code>, <code className="text-sky">get_release</code>, <code className="text-sky">update_release</code>: read and revise drafts</li>
          <li className="font-medium text-soft">Approval and sending are human-only, in this app.</li>
        </ul>
      </div>

      <div className="card mt-8 border-dashed p-5">
        <p className="font-bold text-fg">Demo workspace</p>
        <p className="mt-1 text-sm text-muted">
          This is a public demo. Data is restored automatically every night, and portal links never change.
        </p>
        {user.role === "manager" ? (
          <div className="mt-3"><ResetDemo /></div>
        ) : (
          <p className="mt-2 text-xs text-faint">Switch to the manager to reset it now.</p>
        )}
      </div>
    </div>
  );
}
