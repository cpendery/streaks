import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const { id } = params;
  const { complete }: { complete: boolean } = await request.json();

  await getRequestContext()
    .env.DB.prepare("UPDATE events AS e SET complete = ?1 WHERE e.uid = ?2;")
    .bind(complete ? 1 : 0, id)
    .run();

  return new Response();
}
