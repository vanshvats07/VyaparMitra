import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import GovernmentScheme from "@/models/GovernmentScheme";

const schemeFiltersSchema = z
  .object({
    state: z.string().trim().min(1).max(100).optional(),
    category: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export async function GET(request) {
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validationResult = schemeFiltersSchema.safeParse(queryParams);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid scheme filter parameters. Use state and category.",
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const schemes = await GovernmentScheme.find(validationResult.data)
      .select("-__v")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      schemes,
    });
  } catch (error) {
    console.error("Scheme fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch schemes",
      },
      { status: 500 }
    );
  }
}