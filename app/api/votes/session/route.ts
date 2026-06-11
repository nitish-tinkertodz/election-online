import { NextResponse } from "next/server";

import {
  COMPLETED_ROLES_COOKIE,
  VOTE_SESSION_COOKIE
} from "@/lib/election/session";
import { useSecureCookies } from "@/lib/network/cookie-options";

export async function DELETE() {
  const response = NextResponse.json({
    message: "Voting session cleared."
  });

  response.cookies.set(COMPLETED_ROLES_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookies(),
    path: "/",
    expires: new Date(0)
  });
  response.cookies.set(VOTE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookies(),
    path: "/",
    expires: new Date(0)
  });

  return response;
}
