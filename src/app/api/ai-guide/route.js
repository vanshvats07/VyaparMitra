import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { aiGuideSchema } from "@/lib/validations/aiGuide";
import { formatZodErrors } from "@/lib/validations/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateGeminiText } from "@/lib/gemini";

/**
 * POST /api/ai-guide
 * Generates AI Business Guide responses using the user's stored profile.
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

    if ((await getAuthenticatedUserId()) !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to use this guide" },
        { status: 403 }
      );
    }

    // 4. Connect to database
    await connectDB();

    // 5. Load user business profile (exclude internal fields)
    const user = await User.findById(userId)
      .select("businessIdea businessCategory budget experience state district language")
      .lean();
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
    const businessProfile = {
      businessIdea: user.businessIdea,
      businessCategory: user.businessCategory || "General",
      budget: user.budget,
      experience: user.experience || "Beginner",
      location: { state: user.state, district: user.district },
      language: user.language || "hi",
    };

    const prompt = `You are VyaparMitra, a practical business advisor for small businesses in India.
Answer the user's question clearly and concisely. Use the business profile below to personalize the advice.
Do not invent government scheme eligibility, guarantees, or financial outcomes. Mention when the user should verify details with an official source.

Business profile:
${JSON.stringify(businessProfile, null, 2)}

User question:
${question}`;

    const result = await generateGeminiText(prompt);
    if (result.error === "not_configured") {
      return NextResponse.json(
        {
          success: false,
          message: "AI guide is not configured yet",
        },
        { status: 503 }
      );
    }
    if (result.error) {
      return NextResponse.json(
        { success: false, message: "The AI provider could not answer right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI Guide response generated successfully",
      reply: result.text,
    });
  } catch (error) {
    console.error("AI Guide route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate AI guidance right now",
      },
      { status: 500 }
    );
  }
}
