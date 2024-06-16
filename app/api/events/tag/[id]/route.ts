import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export type TagsPutRequest = {
  name: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const { id } = params;

  const { results: existingTags } = await getRequestContext()
    .env.DB.prepare(
      `SELECT t.name FROM events as e 
        LEFT JOIN event_tags as et ON e.id = et.event_id 
        INNER JOIN tags as t ON et.tag_id = t.id
        WHERE e.uid = ?1`
    )
    .bind(id)
    .all();

  return new Response(JSON.stringify(existingTags.map((t) => t.name)));
}

// TODO: update this to handle multiple items
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const { id } = params;
  const { name }: TagsPutRequest = await request.json();

  const { results: existingTags } = await getRequestContext()
    .env.DB.prepare(
      `SELECT t.name FROM events as e 
        LEFT JOIN event_tags as et ON e.id = et.event_id 
        INNER JOIN tags as t ON et.tag_id = t.id
        WHERE e.uid = ?1`
    )
    .bind(id)
    .all();

  if (existingTags.map((t) => t.name).includes(name)) {
    return new Response();
  }

  const existingEventIdRow = await getRequestContext()
    .env.DB.prepare(
      `SELECT e.id FROM events as e
        WHERE e.uid = ?1`
    )
    .bind(id)
    .first();

  const existingTagIdRow = await getRequestContext()
    .env.DB.prepare(
      `SELECT t.id FROM tags as t
        WHERE t.name = ?1`
    )
    .bind(name)
    .first();

  const existingEventId = existingEventIdRow?.id;
  let existingTagId = existingTagIdRow?.id;

  if (existingTagId == null) {
    const { meta } = await getRequestContext()
      .env.DB.prepare(`INSERT INTO tags (name) VALUES (?1);`)
      .bind(name)
      .run();
    existingTagId = meta.last_row_id;
  }

  await getRequestContext()
    .env.DB.prepare(
      `INSERT INTO event_tags (event_id, tag_id) VALUES (?1, ?2);`
    )
    .bind(existingEventId, existingTagId)
    .all();

  return new Response(undefined, { status: 201 });
}
