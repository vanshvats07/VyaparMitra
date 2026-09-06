import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import User from "@/models/User";
import BusinessMetric from "@/models/BusinessMetric";
import GovernmentScheme from "@/models/GovernmentScheme";
import { calculateBusinessMetrics } from "@/lib/calculations/businessMetrics";
import { generateGeminiText, parseGeminiJson } from "@/lib/gemini";
import {
  recommendationRequestSchema,
  recommendationResponseSchema,
} from "@/lib/validations/recommendation";

function buildRecommendationPrompt({ user, schemes, history, calculatedMetrics }) {
  return `You are a practical business advisor for small businesses in India.
Create personalized recommendations using only the supplied information.
Write every title, description, and reason entirely in ${user.language === "hi" ? "simple, natural Hindi" : "clear English"}. Do not mix languages.

Return JSON only, with this exact shape:
{
  "recommendations": [
    {
      "title": "short action title",
      "description": "practical advice",
      "reason": "why this fits the supplied business information",
      "priority": "high|medium|low"
    }
  ]
}

Do not invent schemes, eligibility rules, benefits, market prices, statistics, guarantees, or profit predictions.
If verified scheme or market information is missing, say that it must be checked from an official source instead of guessing.
Keep recommendations practical and concise. Do not claim the readiness score is scientifically validated.

USER DATA:
${JSON.stringify(
  {
    businessIdea: user.businessIdea,
    businessCategory: user.businessCategory,
    budget: user.budget,
    experience: user.experience,
    location: { state: user.state, district: user.district },
  },
  null,
  2
)}

VERIFIED SCHEME DATA:
${JSON.stringify(schemes, null, 2)}

MARKET DATA:
No verified market data is currently available.

CALCULATED METRICS:
${JSON.stringify(calculatedMetrics, null, 2)}

RECENT BUSINESS RECORDS:
${JSON.stringify(history, null, 2)}`;
}

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

    const validationResult = recommendationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "A valid userId is required" },
        { status: 400 }
      );
    }

    const { userId } = validationResult.data;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if ((await getAuthenticatedUserId()) !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to request recommendations" },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(userId)
      .select("name phone businessIdea businessCategory budget experience state district language")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [schemes, history] = await Promise.all([
      GovernmentScheme.find({
        $or: [
          { state: user.state },
          { state: { $exists: false } },
          { state: "" },
        ],
        ...(user.businessCategory ? { category: user.businessCategory } : {}),
      })
        .select("name description state category eligibility benefits officialUrl lastUpdated")
        .limit(10)
        .lean(),
      BusinessMetric.find({ userId })
        .select("month sales expenses profit")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const prompt = buildRecommendationPrompt({
      user,
      schemes,
      history,
      calculatedMetrics: calculateBusinessMetrics(user),
    });

    const result = await generateGeminiText(prompt, {
      responseMimeType: "application/json",
    });
    if (result.error === "not_configured") {
      return NextResponse.json(
        { success: false, message: "AI recommendations are not configured yet" },
        { status: 503 }
      );
    }
    if (result.error === "timeout") {
      return NextResponse.json(
        {
          success: false,
          message: "Recommendations took too long to generate. Please try again.",
        },
        { status: 504 }
      );
    }
    if (result.error === "provider" && result.status === 429) {
      return NextResponse.json(
        {
          success: false,
          message: "Recommendations are temporarily unavailable because the provider quota has been reached. Please try again later.",
        },
        { status: 503, headers: { "Retry-After": "60" } }
      );
    }
    if (result.error) {
      return NextResponse.json(
        { success: false, message: "The AI provider could not generate recommendations" },
        { status: 502 }
      );
    }

    const responseData = parseGeminiJson(result.text);
    const validatedResponse = recommendationResponseSchema.safeParse(responseData);
    if (!validatedResponse.success) {
      return NextResponse.json(
        { success: false, message: "The AI provider returned an invalid recommendation response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: validatedResponse.data.recommendations,
    });
  } catch (error) {
    console.error("Recommendation route error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to generate recommendations right now" },
      { status: 500 }
    );
  }
}