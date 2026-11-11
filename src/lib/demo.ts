export const SAMPLE_TICKETS = `PLAT-412  Added 4K HDR (Dolby Vision) delivery profile for StreamCo publishing workflow
PLAT-418  Fixed subtitle sync drift >200ms on long-form assets (all clients)
PLAT-421  QC dashboard now flags assets stuck >2h in compliance review (all clients)
PLAT-425  Nova TV: regional language metadata (Kannada, Tamil) now exported in XML feed
PLAT-427  Refactored S3 multipart upload retry logic (internal, no client impact)
PLAT-430  Known issue: bulk publish >500 assets may time out; workaround = batches of 200
PLAT-433  Atlas Sports: live-to-VOD clip turnaround reduced from 30 to 12 minutes
PLAT-436  Upgraded Postgres minor version (internal)`;

export const DEMO_PROMPT =
  "Here are this sprint's tickets. Draft client-facing release notes v2.14 for StreamCo and Nova TV in Shipped. Only include what affects each client, skip internal-only tickets, and write for a non-technical client audience.";

export const DEMO_PASSWORD = "Shipped@2026";
export const DEMO_USERS = {
  manager: { email: "manager@shipped.demo", name: "Priya (Manager)" },
  member: { email: "member@shipped.demo", name: "Arjun (Team)" },
} as const;

export const PORTFOLIO_URL = "https://neeraj-portfolio-orcin.vercel.app/#projects";
