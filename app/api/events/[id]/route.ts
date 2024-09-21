import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";
export type EventDeleteMode = "all" | "this-and-following" | "this";
export type EventsDeleteRequest = {
  sid: string;
  mode: EventDeleteMode;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const { id } = params;
  const { sid, mode }: EventsDeleteRequest = await request.json();
  console.log("payload", sid, mode);

  switch (mode) {
    case "all":
      await deleteAllEvents(sid);
      break;
    case "this-and-following":
      await deleteThisAndFollowingEvents(id, sid);
      break;
    case "this":
      await deleteThisEvent(id);
      break;
  }

  return new Response();
}

const deleteThisAndFollowingEvents = async (id: string, sid: string) => {
  const event = await getRequestContext()
    .env.DB.prepare("SELECT * FROM events AS e WHERE e.uid = ?1")
    .bind(id)
    .first();

  await getRequestContext()
    .env.DB.prepare(
      `DELETE FROM event_tags AS et
       WHERE et.event_id IN (
        SELECT e.id FROM events AS e
        WHERE e.sid = ?1 AND e.date >= ?2
      );`
    )
    .bind(sid, event?.date)
    .run();

  await getRequestContext()
    .env.DB.prepare(`DELETE FROM events as e WHERE sid = ?1 AND e.date >= ?2;`)
    .bind(sid, event?.date)
    .run();
};

const deleteAllEvents = async (sid: string) => {
  await getRequestContext()
    .env.DB.prepare(
      `DELETE FROM event_tags AS et
       WHERE et.event_id IN (
        SELECT e.id FROM events AS e
        WHERE e.sid = ?1
      );`
    )
    .bind(sid)
    .run();

  await getRequestContext()
    .env.DB.prepare(`DELETE FROM events WHERE sid = ?1;`)
    .bind(sid)
    .run();
};

const deleteThisEvent = async (id: string) => {
  await getRequestContext()
    .env.DB.prepare(
      `DELETE FROM event_tags AS et
       WHERE et.event_id IN (
        SELECT e.id FROM events AS e
        WHERE e.uid = ?1
      );`
    )
    .bind(id)
    .run();

  await getRequestContext()
    .env.DB.prepare(`DELETE FROM events WHERE uid = ?1;`)
    .bind(id)
    .run();
};
