import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  comparePassword,
  sanitizeUser,
  setSessionCookie,
} from "@/lib/auth";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { formatZodErrors } from "@/lib/validations/user";

export async function POST(request) {
  try {
    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Authentication is not configured" },
        { status: 503 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid phone number and password.",
          errors: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ phone: validationResult.data.phone }).select(
      "+passwordHash"
    );

    const passwordMatches = user?.passwordHash
      ? await comparePassword(validationResult.data.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });

    return setSessionCookie(response, user._id.toString());
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to log in right now. Please try again." },
      { status: 500 }
    );
  }
}
