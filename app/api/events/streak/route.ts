import { authenticatedRequest } from "@/app/crypto";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest } from "next/server";

export const runtime = "edge";

const findStreakEnd = (completeDays: [string, boolean][]) => {
  return completeDays.findLast(([_, complete]) => complete);
};
const findStreakStart = (completeDays: [string, boolean][], today: number) => {
  let streakStart = findStreakEnd(completeDays);
  const [startDate] = streakStart ?? ["0"];
  for (const day of completeDays.slice().reverse()) {
    const [date, complete] = day;
    if (Number(date) > Number(startDate) && !complete && Number(date) != today)
      return undefined;
    if (Number(date) > Number(startDate)) continue;
    if (!complete) break;
    streakStart = day;
  }
  return streakStart;
};

const findStreakLength = (streakStart: number, streakEnd: number) =>
  Math.round(Math.abs((streakStart - streakEnd) / (24 * 60 * 60 * 1000)));

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
    .env.DB.prepare("SELECT * FROM events AS e WHERE e.date <= ?1;")
    .bind(epochTime)
    .all();

  const completeMap = results.reduce((completeDays, row) => {
    const day = row.date as number;
    const dayComplete = (completeDays[day] as boolean) ?? true;
    const dayData = dayComplete && row.complete;
    return { ...completeDays, [day]: dayData };
  }, {}) as { [day: number]: boolean };

  const completeDays = Object.entries(completeMap).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const streakStart = Number(findStreakStart(completeDays, epochTime)?.at(0));
  const streakEnd = Number(findStreakEnd(completeDays)?.at(0));
  const streakLength = findStreakLength(streakStart, streakEnd) + 1 || 0;

  return new Response(JSON.stringify(streakLength));
}
