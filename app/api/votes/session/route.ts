import { NextResponse } from "next/server";

import {
  COMPLETED_ROLES_COOKIE,
  VOTE_SESSION_COOKIE
} from "@/lib/election/session";

export async function DELETE() {
  const response = NextResponse.json({
    message: "Voting session cleared."
  });

  response.cookies.delete(COMPLETED_ROLES_COOKIE);
  response.cookies.delete(VOTE_SESSION_COOKIE);

  return response;
}
