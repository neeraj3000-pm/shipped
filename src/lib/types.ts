export type Section = "new" | "improved" | "fixed" | "known_issue";
export type Status = "draft" | "in_review" | "approved" | "sent";
export type Role = "manager" | "member";

export type Item = { section: Section; text: string; ticket_id?: string | null };

export type Client = {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  portal_token: string;
  created_at: string;
};

export type Release = {
  id: string;
  client_id: string;
  version: string;
  title: string;
  summary: string;
  status: Status;
  items: Item[];
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  clients?: Pick<Client, "id" | "name" | "slug" | "contact_email" | "portal_token">;
};

export type Activity = { id: string; release_id: string; actor: string; action: string; created_at: string };

export type Profile = { id: string; name: string; role: Role; email: string };

export const SECTIONS: { key: Section; label: string }[] = [
  { key: "new", label: "New" },
  { key: "improved", label: "Improved" },
  { key: "fixed", label: "Fixed" },
  { key: "known_issue", label: "Known issues" },
];

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  sent: "Sent",
};

export const CLAUDE_ACTOR = "Claude (MCP)";
