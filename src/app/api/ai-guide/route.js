import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { aiGuideSchema } from "@/lib/validations/aiGuide";
import { formatZodErrors } from "@/lib/validations/user";

/**
 * POST /api/ai-guide
 * Backend foundation for AI Business Guide.
 * Validates request, retrieves user profile, constructs structured context,
 * and returns a temporary mock response.
 */
export async function POST(request) {
  try {
    // 1. Parse JSON body
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

    // 2. Validate input fields with Zod
    const validationResult = aiGuideSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed. Please provide a valid userId and question.",
          errors: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      );
    }

    const { userId, question } = validationResult.data;

    // 3. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format. Must be a 24-character hex string.",
        },
        { status: 400 }
      );
    }

    // 4. Connect to database
    await connectDB();

    // 5. Load user business profile (exclude internal fields)
    const user = await User.findById(userId).select("-__v").lean();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `User with ID ${userId} not found`,
        },
        { status: 404 }
      );
    }

    // 6. Construct structured context object
    const context = {
      businessProfile: {
        name: user.name,
        businessIdea: user.businessIdea,
        businessCategory: user.businessCategory || "General",
        budget: user.budget,
        experience: user.experience || "Beginner",
        location: {
          state: user.state,
          district: user.district,
          village: user.village || "",
        },
        language: user.language || "hi",
      },
      question,
    };

    // 7. Return structured context in temporary mock response
    return NextResponse.json({
      success: true,
      message: "AI Guide context prepared successfully (mock response)",
      context,
      mockResponse: {
        reply: `Hello ${user.name}! This is a temporary mock response for your question: "${question}". AI model provider will be connected in the next step.`,
        status: "ready_for_ai_integration",
      },
    });
  } catch (error) {
    console.error("AI Guide route error:", error);

    // Sanitize error message to avoid exposing MongoDB credentials or connection strings
    const rawMessage = error.message || "";
    const isSensitive =
      rawMessage.includes("mongodb") ||
      rawMessage.includes("@") ||
      rawMessage.includes("Atlas");

    const safeMessage = isSensitive
      ? "Database operation failed. Please check server connection."
      : rawMessage || "An unexpected error occurred in AI Guide route";

    return NextResponse.json(
      {
        success: false,
        message: safeMessage,
      },
      { status: 500 }
    );
  }
}
