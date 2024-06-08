import { getRequestContext } from "@cloudflare/next-on-pages";
import * as jose from "jose";
import { NextRequest } from "next/server";

export const authenticatedRequest = async (
  request: NextRequest
): Promise<boolean> => {
  const header = request.headers.get("Authorization");
  const jwt = header?.replace("Bearer ", "").trim() ?? "";
  const secret = new TextEncoder().encode(getRequestContext().env.JWT_SECRET);
  try {
    await jose.jwtVerify(jwt, secret, {
      issuer: "streaks",
      audience: "admin",
    });
    return true;
  } catch {
    return false;
  }
};
