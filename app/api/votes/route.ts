import { NextResponse } from "next/server";

import {
  COMPLETED_ROLES_COOKIE,
  getOrCreateVoteSessionKey
} from "@/lib/election/session";
import { submitRoleVote } from "@/lib/votes/vote-service";
import { useSecureCookies } from "@/lib/network/cookie-options";

export async function POST(request: Request) {
  try {
    const sessionKey = await getOrCreateVoteSessionKey();
    const payload = await request.json();
    const result = await submitRoleVote(sessionKey, payload);

    const response = NextResponse.json({
      message: result.is_complete
        ? "Thanks. Your voting session is complete."
        : "Vote saved.",
      ...result
    });

    response.cookies.set(COMPLETED_ROLES_COOKIE, result.session_state, {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookies(),
      path: "/"
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to save the vote."
      },
      { status: 400 }
    );
  }
}
