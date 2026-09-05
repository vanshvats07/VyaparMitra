import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createUserSchema, formatZodErrors } from "@/lib/validations/user";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    // 1. Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON format in request body",
        },
        { status: 400 }
      );
    }

    // 2. Validate input using Zod
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed. Please check the provided information.",
          errors: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Authentication is not configured" },
        { status: 503 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Check for duplicate user by phone number
    const existingUser = await User.findOne({ phone: validatedData.phone });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this phone number already exists.",
          field: "phone",
        },
        { status: 409 }
      );
    }

    // 5. Create new user document
    const user = await User.create(validatedData);

    // 6. Return response with user's _id
    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        _id: user._id,
        user,
      },
      { status: 201 }
    );

    return setSessionCookie(response, user._id.toString());
  } catch (error) {
    console.error("User creation error:", error);

    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this phone number already exists.",
          field: "phone",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create user profile",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getAuthenticatedUserId } = await import("@/lib/auth");
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("-__v");

    return NextResponse.json({
      success: true,
      users: user ? [user] : [],
    });
  } catch (error) {
    console.error("User fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}