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
  const { startDate, endDate, repeatDays, name, repeat }: EventsPutRequest =
    await request.json();

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
  if (repeat && eventDates.length != 0) {
    await getRequestContext().env.DB.batch(
      eventDates.map((date) =>
        getRequestContext()
          .env.DB.prepare(
            "INSERT INTO events (uid, sid, name, complete, date) VALUES (?1, ?2, ?3, 0, ?4);"
          )
          .bind(crypto.randomUUID(), seriesId, name, date.getTime())
      )
    );
  } else if (!repeat) {
    await getRequestContext()
      .env.DB.prepare(
        "INSERT INTO events (uid, sid, name, complete, date) VALUES (?1, ?2, ?3, 0, ?4);"
      )
      .bind(crypto.randomUUID(), seriesId, name, startEpochDate)
      .run();
  }

  return new Response();
}
