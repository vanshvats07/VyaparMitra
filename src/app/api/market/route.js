import { NextResponse } from "next/server";
import { z } from "zod";

const marketFiltersSchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    product: z.string().trim().min(1).max(100).optional(),
    location: z.string().trim().min(1).max(100).optional(),
    state: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export async function GET(request) {
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validationResult = marketFiltersSchema.safeParse(queryParams);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid market filter parameters. Use category, product, location, or state.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Market data source is not configured yet",
    },
    { status: 503 }
  );
}