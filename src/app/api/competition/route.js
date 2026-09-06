import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createDemoCompetitionData } from "@/lib/demoCompetitionData";

const FETCH_TIMEOUT_MS = 7000;
const LEVELS = ["Low", "Medium", "High"];

function text(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeCompetitor(value) {
  if (!value || typeof value !== "object" || !text(value.name)) return null;
  return {
    name: text(value.name),
    category: text(value.category) || "Data unavailable",
    ...(text(value.rating) ? { rating: text(value.rating) } : {}),
    ...(text(value.reviewCount) ? { reviewCount: text(value.reviewCount) } : {}),
    ...(text(value.distance) ? { distance: text(value.distance) } : {}),
    ...(text(value.priceRange) ? { priceRange: text(value.priceRange) } : {}),
    ...(text(value.location) ? { location: text(value.location) } : {}),
    source: text(value.source) || "Official source",
  };
}

function extractCompetitors(payload) {
  const values = Array.isArray(payload) ? payload : payload?.competitors;
  if (!Array.isArray(values)) return [];
  return values.map(normalizeCompetitor).filter(Boolean).slice(0, 20);
}

async function fetchLiveCompetitors(profile) {
  const endpoint = process.env.COMPETITION_API_URL;
  if (!endpoint) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = new URL(endpoint);
    url.searchParams.set("state", profile.state);
    url.searchParams.set("district", profile.district);
    url.searchParams.set("village", profile.village);
    url.searchParams.set("businessCategory", profile.businessCategory);
    url.searchParams.set("businessIdea", profile.businessIdea);
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store" });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.toLowerCase().includes("application/json")) return [];
    return extractCompetitors(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

function assessCompetition(profile, competitors, isDemo) {
  const category = `${profile.businessCategory} ${profile.businessIdea}`.toLowerCase();
  const contextStrength = [profile.businessCategory, profile.businessIdea, profile.state, profile.district, profile.village].filter(Boolean).length;
  if (isDemo) {
    const level = contextStrength >= 4 && /dairy|grocery|retail|food|agri/.test(category) ? "Medium" : "Medium";
    return {
      level,
      explanation: `Competition is assessed as ${level} based on your ${profile.businessCategory || "selected business"} context. Local competitor data is currently unavailable, so this assessment is indicative rather than location-verified.`,
    };
  }
  const strongPresence = competitors.filter((competitor) => Number.parseFloat(competitor.rating) >= 4).length;
  const level = competitors.length >= 8 || (competitors.length >= 5 && strongPresence >= 3)
    ? "High"
    : competitors.length >= 3
      ? "Medium"
      : "Low";
  return {
    level,
    explanation: `Competition is assessed as ${level} from ${competitors.length} live competitor result${competitors.length === 1 ? "" : "s"} returned by the configured source. Review the source details before investing.`,
  };
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId).select("state district village businessIdea businessCategory budget experience").lean();
    if (!user) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    const profile = {
      state: user.state || "",
      district: user.district || "",
      village: user.village || "",
      businessIdea: user.businessIdea || "",
      businessCategory: user.businessCategory || "",
      budget: user.budget || 0,
      experience: user.experience || "",
    };
    const liveCompetitors = await fetchLiveCompetitors(profile);
    const isDemo = liveCompetitors.length === 0;
    const competitors = isDemo ? createDemoCompetitionData(profile) : liveCompetitors;
    const assessment = assessCompetition(profile, competitors, isDemo);

    return NextResponse.json({
      success: true,
      source: isDemo ? "demo" : "live",
      isDemo,
      lastUpdated: isDemo ? null : new Date().toISOString(),
      ...(isDemo ? { message: "Live competitor data is not available. Showing demo data for analysis." } : {}),
      competitors,
      assessment,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Competition API error:", error?.message || "Unknown error");
    return NextResponse.json({ success: false, message: "Unable to load competition data." }, { status: 500 });
  }
}
