import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { aiGuideSchema } from "@/lib/validations/aiGuide";
import { formatZodErrors } from "@/lib/validations/user";
import { getAuthenticatedUserId } from "@/lib/auth";

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "AI guide is not configured. Add GEMINI_API_KEY to the server environment.",
        },
        { status: 503 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = `You are VyaparMitra, a practical business advisor for small businesses in India.
Answer the user's question clearly and concisely. Use the business profile below to personalize the advice.
Do not invent government scheme eligibility, guarantees, or financial outcomes. Mention when the user should verify details with an official source.

Business profile:
${JSON.stringify(context.businessProfile, null, 2)}

User question:
${question}`;

    const providerResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const providerData = await providerResponse.json();
    if (!providerResponse.ok) {
      console.error("Gemini API error:", providerData);
      return NextResponse.json(
        { success: false, message: "The AI provider could not answer right now." },
        { status: 502 }
      );
    }

    const reply = providerData.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!reply) {
      return NextResponse.json(
        { success: false, message: "The AI provider returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI Guide response generated successfully",
      context,
      reply,
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
