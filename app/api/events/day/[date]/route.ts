import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } } // YYYY-MM-DD expected
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }

  const { date } = params;
  const epochTime = new Date(date).getTime();

  const { results } = await getRequestContext()
    .env.DB.prepare("SELECT * FROM events AS e WHERE e.date = ?1;")
    .bind(epochTime)
    .all();

  const response = results.map((row) => ({
    uid: row.uid,
    name: row.name,
    complete: !!row.complete,
    date: new Date(row.date as number).toISOString(),
  }));

  return new Response(JSON.stringify(response));
}
