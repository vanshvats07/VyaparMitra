import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateGeminiText, parseGeminiJson } from "@/lib/gemini";
import { localMarketRequestSchema } from "@/lib/validations/localMarket";

const LEVELS = new Set(["Low", "Medium", "High"]);

function cleanText(value, fallback = "Data unavailable") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanList(value, limit = 6) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim())
    .slice(0, limit);
}

function cleanSegments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((segment) => segment && typeof segment === "object")
    .map((segment) => ({
      name: cleanText(segment.name),
      potential: cleanText(segment.potential),
      whyItMatters: cleanText(segment.whyItMatters),
      suggestedApproach: cleanText(segment.suggestedApproach),
    }))
    .slice(0, 6);
}

function normalizeAssessment(value) {
  if (!value || typeof value !== "object") return null;
  const score = Number(value.marketOpportunityScore);
  if (!Number.isFinite(score)) return null;
  const recommendation = value.recommendation && typeof value.recommendation === "object"
    ? value.recommendation
    : {};

  return {
    marketOpportunityScore: Math.max(0, Math.min(100, Math.round(score))),
    competitionLevel: LEVELS.has(value.competitionLevel) ? value.competitionLevel : "Data unavailable",
    demandPotential: LEVELS.has(value.demandPotential) ? value.demandPotential : "Data unavailable",
    entryDifficulty: LEVELS.has(value.entryDifficulty) ? value.entryDifficulty : "Data unavailable",
    businessRisk: LEVELS.has(value.businessRisk) ? value.businessRisk : "Data unavailable",
    opportunities: cleanList(value.opportunities),
    competitiveAdvantages: cleanList(value.competitiveAdvantages, 5),
    locationStrategy: cleanList(value.locationStrategy, 7),
    customerSegments: cleanSegments(value.customerSegments),
    marketGaps: cleanList(value.marketGaps, 5),
    recommendation: {
      summary: cleanText(recommendation.summary),
      biggestOpportunity: cleanText(recommendation.biggestOpportunity),
      biggestRisk: cleanText(recommendation.biggestRisk),
      firstAction: cleanText(recommendation.firstAction),
      avoid: cleanText(recommendation.avoid),
    },
  };
}

export async function POST(request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId();
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, message: "Please log in to analyze your local market." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Please provide valid analysis details." }, { status: 400 });
    }

    const validationResult = localMarketRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: "Please provide a business category and location before analyzing." }, { status: 400 });
    }

    const context = validationResult.data;
    const prompt = `You are VyaparMitra's Local Market Analyzer for a small business in India.
Return valid JSON only. This is an AI assessment, not verified local market data.
Use only the provided business and location context plus general business knowledge. Do not invent or imply real competitor names, competitor counts, ratings, distances, prices, customer counts, market sizes, exact sales, exact foot traffic, government statistics, or other local statistics. Do not claim that any business is actually present in the location. Do not provide exact numerical estimates except marketOpportunityScore, which must be a reasoned 0-100 assessment based on the supplied context.
If specific local data is unavailable, say "Data unavailable" or clearly phrase the result as an AI assessment based on the provided information.
Personalize the suggestions to the category, business, budget, customer targets, experience, and location. Do not guarantee profit or demand.

Return exactly this JSON shape:
{
  "marketOpportunityScore": 0,
  "competitionLevel": "Low",
  "demandPotential": "Medium",
  "entryDifficulty": "Medium",
  "businessRisk": "Medium",
  "opportunities": [],
  "competitiveAdvantages": [],
  "locationStrategy": [],
  "customerSegments": [{ "name": "", "potential": "", "whyItMatters": "", "suggestedApproach": "" }],
  "marketGaps": [],
  "recommendation": { "summary": "", "biggestOpportunity": "", "biggestRisk": "", "firstAction": "", "avoid": "" }
}

Allowed level values are exactly: Low, Medium, High.

Business context:
${JSON.stringify(context, null, 2)}`;

    const result = await generateGeminiText(prompt, {
      timeoutMs: 25000,
      responseMimeType: "application/json",
      systemInstruction: "You provide careful, practical small-business analysis. Never fabricate real-world local data. Return only valid JSON when asked.",
    });

    if (result.error === "not_configured") {
      return NextResponse.json({ success: false, message: "The market analyzer AI is not configured yet." }, { status: 503 });
    }
    if (result.error) {
      return NextResponse.json({ success: false, message: "The market analysis is temporarily unavailable. Please try again." }, { status: 502 });
    }

    const assessment = normalizeAssessment(parseGeminiJson(result.text));
    if (!assessment) {
      return NextResponse.json({ success: false, message: "The market analysis could not be read. Please try again." }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      source: "AI Market Assessment",
      realDataAvailable: false,
      assessment,
    });
  } catch (error) {
    console.error("Local market analysis error:", error?.message || "Unknown error");
    return NextResponse.json({ success: false, message: "The market analyzer is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
