import { NextResponse } from "next/server";

import {
  COMPLETED_ROLES_COOKIE,
  getCompletedRolesFromCookie,
  getOrCreateVoteSessionKey
} from "@/lib/election/session";
import { submitRoleVote } from "@/lib/votes/vote-service";

export async function POST(request: Request) {
  try {
    const sessionKey = await getOrCreateVoteSessionKey();
    const payload = await request.json();
    const completedRoleIds = await getCompletedRolesFromCookie();
    const result = await submitRoleVote(sessionKey, payload, completedRoleIds);

    const response = NextResponse.json({
      message: result.is_complete
        ? "Thanks. Your voting session is complete."
        : "Vote saved.",
      ...result
    });

    response.cookies.set(COMPLETED_ROLES_COOKIE, result.session_state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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
