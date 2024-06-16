import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { authenticatedRequest } from "@/app/crypto";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }

  const { results } = await getRequestContext()
    .env.DB.prepare("SELECT * FROM tags;")
    .all();

  const response = results.map((row) => row.name);

  return new Response(JSON.stringify(response));
}

export type TagsPutRequest = {
  name: string;
};

export async function PUT(request: NextRequest) {
  if (!(await authenticatedRequest(request))) {
    return new Response(undefined, { status: 401 });
  }

  const { name }: TagsPutRequest = await request.json();

  const { results } = await getRequestContext()
    .env.DB.prepare("INSERT INTO tags (name) VALUES (?1);")
    .bind(name)
    .all();

  const response = results.map((row) => row.name);

  return new Response(JSON.stringify(response));
}
