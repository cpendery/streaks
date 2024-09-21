import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export type Task = {
  complete: boolean;
  tags: string[];
  name: string;
  uid: string;
  sid: string;
};

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
    .env.DB.prepare(
      `SELECT e.*, t.name AS tag_name FROM events AS e 
       LEFT JOIN event_tags AS et ON e.id = et.event_id 
       LEFT JOIN tags AS t ON et.tag_id = t.id
       WHERE e.date = ?1;`
    )
    .bind(epochTime)
    .all();

  const responseMap = results.reduce((acc, row) => {
    if (acc.has(row.uid)) {
      const item = acc.get(row.uid);
      acc.set(row.uid, { ...item, tags: [...item.tags, row.tag_name] });
    } else {
      acc.set(row.uid, {
        uid: row.uid,
        sid: row.sid,
        name: row.name,
        complete: !!row.complete,
        date: new Date(row.date as number).toISOString(),
        tags: row.tag_name != null ? [row.tag_name] : [],
      });
    }
    return acc;
  }, new Map());

  const response = Array.from(responseMap.values());

  return new Response(JSON.stringify(response));
}
