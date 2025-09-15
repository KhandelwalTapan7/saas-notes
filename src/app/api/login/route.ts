export const runtime = "nodejs";
import { prisma } from "@/lib/db";
import { withCORS, preflight } from "@/lib/cors";
import { signJwt } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";


const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { email, password } = Body.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), withCORS({ status: 401 }));
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return new Response(JSON.stringify({ error: "Invalid credentials" }), withCORS({ status: 401 }));
    const token = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MEMBER",
      tenant: { id: user.tenantId, slug: user.tenant.slug }
    });
    return new Response(JSON.stringify({ token }), withCORS({ status: 200 }));
  } catch {
    return new Response(JSON.stringify({ error: "Bad Request" }), withCORS({ status: 400 }));
  }
}
export function OPTIONS() { return preflight(); }
