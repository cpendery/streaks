import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export type EventsPutRequest = {
  name: string;
  startDate: string;
  repeat: boolean;
  endDate?: string;
  repeatDays?: number[];
  tags: string[];
};

const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

export async function PUT(request: NextRequest) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }
  const {
    startDate,
    endDate,
    repeatDays,
    name,
    repeat,
    tags,
  }: EventsPutRequest = await request.json();

  let tagIds: string[] = [];
  if (tags.length != 0) {
    const { results: existingTags } = await getRequestContext()
      .env.DB.prepare(
        `SELECT * FROM tags AS t WHERE t.name IN (${tags
          .map((_, idx) => `?${idx + 1}`)
          .join(", ")})`
      )
      .bind(...tags)
      .all();
    tagIds = existingTags.map((row) => row.id) as string[];
  }

  const eventDates = [];
  const startEpochDate = new Date(startDate).getTime();
  if (repeat) {
    const endEpochDate = new Date(endDate!).getTime();
    let focusDate = new Date(startEpochDate);
    while (focusDate.getTime() <= endEpochDate) {
      if (repeatDays?.includes(focusDate.getDay())) {
        eventDates.push(new Date(focusDate));
      }
      focusDate = addDays(focusDate, 1);
    }
  }

  const seriesId = crypto.randomUUID();
  let eventIds: string[] = [];
  if (repeat && eventDates.length != 0) {
    const batchResults = await getRequestContext().env.DB.batch(
      eventDates.map((date) =>
        getRequestContext()
          .env.DB.prepare(
            "INSERT INTO events (uid, sid, name, complete, date) VALUES (?1, ?2, ?3, 0, ?4) RETURNING id;"
          )
          .bind(crypto.randomUUID(), seriesId, name, date.getTime())
      )
    );
    eventIds = batchResults // @ts-ignore
      .map((tx) => tx.results.map((row) => row.id))
      .flat();
  } else if (!repeat) {
    const results = await getRequestContext()
      .env.DB.prepare(
        "INSERT INTO events (uid, sid, name, complete, date) VALUES (?1, ?2, ?3, 0, ?4) RETURNING id;"
      )
      .bind(crypto.randomUUID(), seriesId, name, startEpochDate)
      .run();
    // @ts-ignore
    eventIds = results.results.map((row) => row.id);
  }

  if (tagIds.length != 0) {
    await getRequestContext().env.DB.batch(
      tagIds
        .map((tagId) =>
          eventIds.map((eventId) =>
            getRequestContext()
              .env.DB.prepare(
                "INSERT INTO event_tags (event_id, tag_id) VALUES (?1, ?2);"
              )
              .bind(eventId, tagId)
          )
        )
        .flat()
    );
  }

  return new Response();
}
