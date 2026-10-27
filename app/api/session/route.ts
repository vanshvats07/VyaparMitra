import { NextResponse } from "next/server";
import { revokeCurrentProfileSession } from "../../../lib/profile-session";
import { isSameOriginRequest } from "../../../lib/request-security";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request could not be verified. Please try again." },
      { status: 403 },
    );
  }

  await revokeCurrentProfileSession();
  return NextResponse.json({ ok: true });
}
