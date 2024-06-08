import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as jose from "jose";

export const runtime = "edge";

const createToken = async (): Promise<string> => {
  const secret = new TextEncoder().encode(getRequestContext().env.JWT_SECRET);
  const jwt = await new jose.SignJWT()
    .setProtectedHeader({ alg: "HS512" })
    .setAudience("admin")
    .setIssuer("streaks")
    .setExpirationTime("24h")
    .sign(secret);

  return jwt;
};

export async function POST(request: NextRequest) {
  const { password }: { password: string } = await request.json();

  const encoder = new TextEncoder();
  const hashBytes = await crypto.subtle.digest(
    "SHA-512",
    encoder.encode(password + getRequestContext().env.USER_SALT)
  );
  const hash = Buffer.from(new Uint8Array(hashBytes)).toString("hex");
  if (hash != getRequestContext().env.USER_HASH) {
    return new Response(undefined, { status: 401 });
  }
  const token = await createToken();

  return new Response(JSON.stringify({ token }));
}
