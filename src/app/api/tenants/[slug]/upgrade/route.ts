// src/app/api/tenants/[slug]/upgrade/route.ts
import { prisma } from "@/lib/db";
import { withCORS, preflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/auth";

export function OPTIONS() {
  return preflight();
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate admin and get typed user (sub + tenant.id guaranteed)
    const user = requireAdmin(req);

    // Prevent cross-tenant upgrades
    if ((user.tenant.slug ?? "") !== params.slug) {
      return new Response(JSON.stringify({ error: "Forbidden" }), withCORS({ status: 403 }));
    }

    const updated = await prisma.tenant.update({
      where: { slug: params.slug },
      data: { plan: "PRO" },
    });

    return new Response(JSON.stringify(updated), withCORS({ status: 200 }));
  } catch (e: any) {
    if (e instanceof Response) return e; // bubble up 401/403 from requireAdmin
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), withCORS({ status: 500 }));
  }
}
