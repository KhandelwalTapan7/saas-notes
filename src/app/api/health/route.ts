import { withCORS } from "@/lib/cors";

export function GET() {
  return new Response(JSON.stringify({ status: "ok" }), withCORS({ status: 200 }));
}
export function OPTIONS() { return preflight(); }
