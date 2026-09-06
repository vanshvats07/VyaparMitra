import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthenticatedUserId, sanitizeUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Auth session lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify your session" },
      { status: 500 }
    );
  }
}
