import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BusinessMetric from "@/models/BusinessMetric";
import User from "@/models/User";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const routeParams = await params;
    const id = typeof routeParams?.id === "string" ? routeParams.id.trim() : "";

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id)
      .select(
        "name phone state district village businessIdea businessCategory budget experience language"
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

    if ((await getAuthenticatedUserId()) !== id) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to access these metrics" },
        { status: 403 }
      );
    }

    const storedMetrics = await BusinessMetric.find({ userId: id }).lean();
    const metrics = storedMetrics.reduce(
      (totals, metric) => ({
        sales: totals.sales + (Number(metric.sales) || 0),
        expenses: totals.expenses + (Number(metric.expenses) || 0),
        profit: totals.profit + (Number(metric.profit) || 0),
      }),
      { sales: 0, expenses: 0, profit: 0 }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village,
        businessIdea: user.businessIdea,
        businessCategory: user.businessCategory,
        budget: user.budget,
        experience: user.experience,
        language: user.language,
      },
      metrics,
    });
  } catch (error) {
    console.error("Business metrics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load user profile",
      },
      { status: 500 }
    );
  }
}