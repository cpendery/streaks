import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const { id } = params;

  await getRequestContext()
    .env.DB.prepare(
      `DELETE FROM event_tags AS et
       WHERE et.event_id IN (
        SELECT e.id FROM events AS e
        WHERE uid = ?1
       );`
    )
    .bind(id)
    .run();

  await getRequestContext()
    .env.DB.prepare(`DELETE FROM events WHERE uid = ?1;`)
    .bind(id)
    .run();

  return new Response();
}
