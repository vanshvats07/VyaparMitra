import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getAuthenticatedUserId,
  hashPassword,
  sanitizeUser,
  setSessionCookie,
} from "@/lib/auth";
import User from "@/models/User";
import { createUserSchema, formatZodErrors } from "@/lib/validations/user";

export async function POST(request) {
  try {
    if (await getAuthenticatedUserId()) {
      return NextResponse.json(
        { success: false, message: "You are already logged in." },
        { status: 409 }
      );
    }

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

    if (!validatedData.password) {
      return NextResponse.json(
        { success: false, message: "Password is required when creating an account." },
        { status: 400 }
      );
    }

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Authentication is not configured" },
        { status: 503 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ phone: validatedData.phone });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number already registered. Please login.",
          field: "phone",
        },
        { status: 409 }
      );
    }

    const profileData = { ...validatedData };
    const password = profileData.password;
    delete profileData.password;
    delete profileData.confirmPassword;
    const user = await User.create({
      ...profileData,
      passwordHash: await hashPassword(password),
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        _id: user._id,
        user: sanitizeUser(user),
      },
      { status: 201 }
    );

    return setSessionCookie(response, user._id.toString());
  } catch (error) {
    console.error("User creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number already registered. Please login.",
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