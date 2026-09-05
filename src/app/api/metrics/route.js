import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import BusinessMetric from "@/models/BusinessMetric";
import User from "@/models/User";
import { createMetricSchema } from "@/lib/validations/metric";
import { formatZodErrors } from "@/lib/validations/user";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function POST(request) {
  try {
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

    const validationResult = createMetricSchema.safeParse(body);

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

    if (!mongoose.Types.ObjectId.isValid(validatedData.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format. Must be a 24-character hex string.",
        },
        { status: 400 }
      );
    }

    if ((await getAuthenticatedUserId()) !== validatedData.userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to add metrics for this user" },
        { status: 403 }
      );
    }

    await connectDB();

    const userExists = await User.findById(validatedData.userId);
    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: `User with ID ${validatedData.userId} not found`,
        },
        { status: 404 }
      );
    }

    const profit =
      typeof validatedData.profit === "number"
        ? validatedData.profit
        : validatedData.sales - validatedData.expenses;

    const metric = await BusinessMetric.create({
      userId: validatedData.userId,
      month: validatedData.month,
      sales: validatedData.sales,
      expenses: validatedData.expenses,
      profit,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Metric created successfully",
        metric,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Metric creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save business metric",
      },
      { status: 500 }
    );
  }
}
