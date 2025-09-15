import { prisma } from "@/lib/db";
import { withCORS, preflight } from "@/lib/cors";
import { requireUser, requireAdmin } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const user = requireUser(req);
    requireAdmin(user);
    if (user.tenant.slug !== params.slug)
      return new Response(JSON.stringify({ error: "Forbidden" }), withCORS({ status: 403 }));
    const updated = await prisma.tenant.update({ where: { slug: params.slug }, data: { plan: "PRO" } });
    return new Response(JSON.stringify({ ok: true, plan: updated.plan }), withCORS({ status: 200 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Unauthorized" }), withCORS({ status: 401 }));
  }
}
export function OPTIONS() { return preflight(); }
