import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * GET /api/users/[id]
 * Fetches a single user document by their MongoDB _id.
 */
export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;

    // 1. Validate that the ID parameter is provided and is a valid MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format. Must be a 24-character hex string.",
        },
        { status: 400 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Find user by ID (excluding internal __v)
    const user = await User.findById(id).select("-__v");

    // 4. Return 404 if user does not exist
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `User with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    // 5. Return the found user
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Fetch user by ID error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
