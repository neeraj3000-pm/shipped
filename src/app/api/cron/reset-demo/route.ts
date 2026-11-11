import { resetDemo } from "@/lib/demo-reset";

export const dynamic = "force-dynamic";

// Called daily by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await resetDemo();
  return Response.json({ ok: true, ...result, at: new Date().toISOString() });
}
