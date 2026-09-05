import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { calculateBusinessMetrics } from "@/lib/calculations/businessMetrics";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id)
      .select(
        "name phone state district businessIdea businessCategory budget experience"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      metrics: calculateBusinessMetrics(user),
    });
  } catch (error) {
    console.error("Business metrics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to calculate business metrics",
      },
      { status: 500 }
    );
  }
}