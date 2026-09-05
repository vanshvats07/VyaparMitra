import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import BusinessMetric from "@/models/BusinessMetric";
import User from "@/models/User";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format. Must be a 24-character hex string.",
        },
        { status: 400 }
      );
    }

    if ((await getAuthenticatedUserId()) !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to access these metrics" },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `User with ID ${userId} not found`,
        },
        { status: 404 }
      );
    }

    const metrics = await BusinessMetric.find({ userId }).sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Fetch metrics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch metrics",
      },
      { status: 500 }
    );
  }
}
