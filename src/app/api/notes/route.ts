import { prisma } from "@/lib/db";
import { withCORS, preflight } from "@/lib/cors";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const NoteBody = z.object({ title: z.string().min(1).max(120), content: z.string().default("") });

export async function GET(req: Request) {
  try {
    const user = requireUser(req);
    const notes = await prisma.note.findMany({
      where: { tenantId: user.tenant.id },
      orderBy: { createdAt: "desc" }
    });
    return new Response(JSON.stringify(notes), withCORS({ status: 200 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Unauthorized" }), withCORS({ status: 401 }));
  }
}

export async function POST(req: Request) {
  try {
    const user = requireUser(req);
    const { title, content } = NoteBody.parse(await req.json());
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenant.id } });
    if (!tenant) return new Response(JSON.stringify({ error: "Tenant not found" }), withCORS({ status: 404 }));
    if (tenant.plan === "FREE") {
      const count = await prisma.note.count({ where: { tenantId: tenant.id } });
      if (count >= 3) {
        return new Response(JSON.stringify({ error: "Free plan limit reached. Upgrade to Pro." }),
          withCORS({ status: 403 }));
      }
    }
    const note = await prisma.note.create({
      data: { title, content, tenantId: user.tenant.id, authorUserId: user.sub }
    });
    return new Response(JSON.stringify(note), withCORS({ status: 201 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Bad Request" }), withCORS({ status: 400 }));
  }
}
export function OPTIONS() { return preflight(); }
