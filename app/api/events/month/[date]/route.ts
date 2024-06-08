import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export type MonthOverview = {
  [day: string]: { complete: number; total: number } | undefined;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } } // YYYY-MM expected
) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }

  const { date } = params;
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setMonth(endDate.getMonth() + 1);

  const { results } = await getRequestContext()
    .env.DB.prepare(
      "SELECT * FROM events AS e WHERE e.date >= ?1 AND e.date < ?2;"
    )
    .bind(startDate.getTime(), endDate.getTime())
    .all();

  const monthOverview: MonthOverview = results.reduce((monthData, row) => {
    const day = new Date(row.date as number).getUTCDate();
    const dayData = (monthData[day] as { complete: number; total: number }) ?? {
      complete: 0,
      total: 0,
    };
    dayData.complete += row.complete ? 1 : 0;
    dayData.total++;
    return { ...monthData, [day]: dayData };
  }, {}) as any;

  return new Response(JSON.stringify(monthOverview));
}
