import { prisma } from "@/lib/db";
import { withCORS, preflight } from "@/lib/cors";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const NoteUpdate = z.object({ title: z.string().min(1).max(120).optional(), content: z.string().optional() });

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireUser(req);
    const note = await prisma.note.findUnique({ where: { id: params.id } });
    if (!note || note.tenantId !== user.tenant.id)
      return new Response(JSON.stringify({ error: "Not found" }), withCORS({ status: 404 }));
    return new Response(JSON.stringify(note), withCORS({ status: 200 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Unauthorized" }), withCORS({ status: 401 }));
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireUser(req);
    const patch = NoteUpdate.parse(await req.json());
    const note = await prisma.note.findUnique({ where: { id: params.id } });
    if (!note || note.tenantId !== user.tenant.id)
      return new Response(JSON.stringify({ error: "Not found" }), withCORS({ status: 404 }));
    const updated = await prisma.note.update({ where: { id: params.id }, data: patch });
    return new Response(JSON.stringify(updated), withCORS({ status: 200 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Bad Request" }), withCORS({ status: 400 }));
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireUser(req);
    const note = await prisma.note.findUnique({ where: { id: params.id } });
    if (!note || note.tenantId !== user.tenant.id)
      return new Response(JSON.stringify({ error: "Not found" }), withCORS({ status: 404 }));
    await prisma.note.delete({ where: { id: params.id } });
    return new Response(null, withCORS({ status: 204 }));
  } catch (e: any) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: "Bad Request" }), withCORS({ status: 400 }));
  }
}
export function OPTIONS() { return preflight(); }
