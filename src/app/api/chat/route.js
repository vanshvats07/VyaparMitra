import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateGeminiText } from "@/lib/gemini";
import User from "@/models/User";
import { chatRequestSchema } from "@/lib/validations/chat";
import { formatZodErrors } from "@/lib/validations/user";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid user ID and message.",
          errors: formatZodErrors(validationResult.error),
        },
        { status: 400 }
      );
    }

    const { userId, message } = validationResult.data;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if ((await getAuthenticatedUserId()) !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to use this chat" },
        { status: 403 }
      );
    }

    await connectDB();
    const user = await User.findById(userId)
      .select("businessIdea businessCategory budget experience state district language")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const businessProfile = {
      businessIdea: user.businessIdea,
      businessCategory: user.businessCategory || "General",
      budget: user.budget,
      experience: user.experience || "Beginner",
      location: { state: user.state, district: user.district },
      language: user.language || "hi",
    };
    const prompt = `You are VyaparMitra, a practical business advisor for small businesses in India.
Answer the user's message clearly and concisely using the business profile when relevant.
Clearly label user-provided information and AI suggestions when useful.
Do not guarantee profits or financial outcomes. Do not invent schemes, eligibility rules, market prices, statistics, or other facts.
For government schemes or market information, say what must be verified with an official or current source. If needed information is unavailable, say so instead of guessing.

Business profile (user-provided):
${JSON.stringify(businessProfile, null, 2)}

User message:
${message}`;

    const result = await generateGeminiText(prompt);
    if (result.error === "not_configured") {
      return NextResponse.json(
        { success: false, message: "The AI chat is not configured yet" },
        { status: 503 }
      );
    }
    if (result.error) {
      return NextResponse.json(
        { success: false, message: "Unable to process your message" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, reply: result.text });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to process your message" },
      { status: 500 }
    );
  }
}