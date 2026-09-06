import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  getAuthenticatedUserId,
  hashPassword,
  sanitizeUser,
} from "@/lib/auth";
import { createUserSchema, formatZodErrors } from "@/lib/validations/user";

/**
 * GET /api/users/[id]
 * Fetches a single user document by their MongoDB _id.
 */
export async function GET(request, { params }) {
  try {
    const routeParams = await params;
    const id = typeof routeParams?.id === "string" ? routeParams.id.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format. Must be a 24-character hex string.",
        },
        { status: 400 }
      );
    }

    const authenticatedUserId = await getAuthenticatedUserId();
    if (authenticatedUserId !== id) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to access this user" },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `User with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Fetch user by ID error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format." },
        { status: 400 }
      );
    }

    const authenticatedUserId = await getAuthenticatedUserId();
    if (authenticatedUserId !== id) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to update this user" },
        { status: 403 }
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

    await connectDB();

    const duplicatePhone = await User.findOne({
      phone: validationResult.data.phone,
      _id: { $ne: id },
    });
    if (duplicatePhone) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this phone number already exists.",
          field: "phone",
        },
        { status: 409 }
      );
    }

    const updateData = { ...validationResult.data };
    if (updateData.password) {
      updateData.passwordHash = await hashPassword(updateData.password);
    }
    delete updateData.password;
    delete updateData.confirmPassword;

    const user = await User.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).select("-__v");

    if (!user) {
      return NextResponse.json(
        { success: false, message: `User with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
