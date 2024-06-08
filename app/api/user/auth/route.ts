import type { NextRequest } from "next/server";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }

  return new Response(undefined, { status: 200 });
}
