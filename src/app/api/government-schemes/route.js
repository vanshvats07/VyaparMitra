import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { demoGovernmentSchemes } from "@/lib/demoGovernmentSchemes";

const FETCH_TIMEOUT_MS = 7000;

function text(value, fallback = "Data unavailable") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function list(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function normalizeScheme(value) {
  if (!value || typeof value !== "object" || !text(value.name, "")) return null;
  return {
    name: text(value.name, "Unnamed scheme"),
    description: text(value.description),
    ministry: text(value.ministry || value.department),
    eligibility: list(value.eligibility),
    benefits: list(value.benefits),
    documents: list(value.documents || value.requiredDocuments),
    applicationProcess: text(value.applicationProcess || value.application_process),
    officialUrl: typeof value.officialUrl === "string" && /^https:\/\//i.test(value.officialUrl) ? value.officialUrl : "",
    category: text(value.category, "Other"),
    states: list(value.states || value.state),
    categoryTags: list(value.categoryTags || value.categories),
  };
}

function extractSchemes(payload) {
  const values = Array.isArray(payload) ? payload : payload?.schemes;
  if (!Array.isArray(values)) return [];
  return values.map(normalizeScheme).filter(Boolean);
}

function scoreScheme(scheme, profile) {
  const haystack = [scheme.name, scheme.description, scheme.category, ...scheme.categoryTags].join(" ").toLowerCase();
  const category = `${profile.businessCategory} ${profile.businessIdea}`.toLowerCase();
  let score = 0;
  if (category && haystack.includes(category)) score += 5;
  ["dairy", "food", "retail", "agriculture", "msme", "women", "self employment", "rural"].forEach((keyword) => {
    if (category.includes(keyword) && haystack.includes(keyword)) score += 2;
  });
  if (scheme.states.some((state) => state.toLowerCase() === "all india" || state.toLowerCase() === profile.state.toLowerCase())) score += 1;
  return score;
}

function personalize(schemes, profile) {
  return schemes
    .map((scheme) => ({ ...scheme, relevanceScore: scoreScheme(scheme, profile) }))
    .sort((left, right) => right.relevanceScore - left.relevanceScore || left.name.localeCompare(right.name))
    .map(({ relevanceScore, ...scheme }) => ({
      ...scheme,
      whyRelevant: relevanceScore > 0
        ? `Potentially relevant to your ${profile.businessCategory || "business"} profile and location.`
        : "Potentially relevant; compare the official eligibility criteria with your business profile.",
    }));
}

async function fetchOfficialSchemes() {
  const endpoint = process.env.GOVERNMENT_SCHEMES_API_URL;
  if (!endpoint) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, { signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store" });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.toLowerCase().includes("application/json")) return [];
    return extractSchemes(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId).select("state district businessCategory businessIdea budget experience").lean();
    if (!user) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    const profile = {
      state: user.state || "",
      district: user.district || "",
      businessCategory: user.businessCategory || "",
      businessIdea: user.businessIdea || "",
      budget: user.budget || 0,
      experience: user.experience || "",
    };
    const liveSchemes = await fetchOfficialSchemes();
    const isDemo = liveSchemes.length === 0;
    const schemes = personalize(isDemo ? demoGovernmentSchemes : liveSchemes, profile);
    return NextResponse.json({
      success: true,
      source: isDemo ? "demo" : "live",
      isDemo,
      lastUpdated: isDemo ? null : new Date().toISOString(),
      schemes,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Government schemes error:", error?.message || "Unknown error");
    return NextResponse.json({ success: false, message: "Unable to load government schemes." }, { status: 500 });
  }
}
