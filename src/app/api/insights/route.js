import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateGeminiText, parseGeminiJson } from "@/lib/gemini";
import User from "@/models/User";
import BusinessMetric from "@/models/BusinessMetric";
import GovernmentScheme from "@/models/GovernmentScheme";
import { calculateBusinessMetrics } from "@/lib/calculations/businessMetrics";
import {
  insightsRequestSchema,
  insightsResponseSchema,
} from "@/lib/validations/insights";
import {
  getDemoBusinessInsights,
  getDemoFinancialData,
} from "@/lib/demoFinancialData";

function buildInsightsPrompt({ user, schemes, history, calculatedMetrics }) {
  return `You are a practical business advisor for small businesses in India.
Create a short business insight report using only the supplied information.

Return JSON only with this exact shape:
{
  "summary": "short current situation summary",
  "opportunities": ["practical opportunity"],
  "risks": ["specific risk or limitation"],
  "nextSteps": ["clear next action"]
}

Use the user's actual budget, category, experience, location, profile completeness, and business records.
Use scheme details only as verified scheme information. Market data is unavailable unless explicitly supplied.
Do not invent schemes, eligibility rules, market prices, statistics, financial projections, or guarantees.
Do not claim that any score is scientifically validated. If information is missing, say it is unavailable.
Keep each list concise and practical.

USER PROFILE (user-provided):
${JSON.stringify(
    {
      businessIdea: user.businessIdea || "Unavailable",
      businessCategory: user.businessCategory || "Unavailable",
      budget: user.budget ?? "Unavailable",
      experience: user.experience || "Unavailable",
      location: {
        state: user.state || "Unavailable",
        district: user.district || "Unavailable",
      },
    },
    null,
    2
  )}

VERIFIED GOVERNMENT SCHEMES:
${JSON.stringify(schemes, null, 2)}

VERIFIED MARKET DATA:
Unavailable. The market data source is not configured.

CALCULATED PROFILE METRICS:
${JSON.stringify(calculatedMetrics, null, 2)}

RECENT BUSINESS RECORDS:
${JSON.stringify(history, null, 2)}`;
}

export async function GET(request) {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const validationResult = insightsRequestSchema.safeParse(query);

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
        { success: false, message: "You are not authorized to view these insights" },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(userId)
      .select("name phone businessIdea businessCategory budget experience state district")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [schemeResult, historyResult] = await Promise.allSettled([
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

    const schemes =
      schemeResult.status === "fulfilled"
        ? schemeResult.value
        : { unavailable: true };
    const history =
      historyResult.status === "fulfilled"
        ? historyResult.value
        : [];
    const insightHistory = history.length > 0 ? history : getDemoFinancialData(user);
    const prompt = buildInsightsPrompt({
      user,
      schemes,
      history: insightHistory,
      calculatedMetrics: calculateBusinessMetrics(user),
    });

    const result = await generateGeminiText(prompt, {
      responseMimeType: "application/json",
    });
    if (result.error === "not_configured") {
      console.warn("AI insights are not configured; using rule-based fallback.");
      return NextResponse.json({
        success: true,
        insights: {
          ...getDemoBusinessInsights(user, insightHistory),
          isFallback: true,
        },
      });
    }
    if (result.error) {
      console.error("AI provider failed; using rule-based fallback:", result.error);
      return NextResponse.json({
        success: true,
        insights: {
          ...getDemoBusinessInsights(user, insightHistory),
          isFallback: true,
        },
      });
    }

    const responseData = parseGeminiJson(result.text);
    const validatedResponse = insightsResponseSchema.safeParse(responseData);
    if (!validatedResponse.success) {
      console.error("AI provider returned invalid insights; using rule-based fallback.");
      return NextResponse.json({
        success: true,
        insights: {
          ...getDemoBusinessInsights(user, insightHistory),
          isFallback: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      insights: validatedResponse.data,
    });
  } catch (error) {
    console.error("Insights route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate business insights" },
      { status: 500 }
    );
  }
}