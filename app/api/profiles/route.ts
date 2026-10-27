import { NextResponse } from "next/server";
import { BusinessProfile } from "../../../models/BusinessProfile";
import { createProfileSession } from "../../../lib/profile-session";
import { isSameOriginRequest } from "../../../lib/request-security";
import {
  businessDetailsSchema,
  profileInputSchema,
} from "../../../lib/profile-schema";
import { connectToDatabase } from "../../../lib/mongodb";
import { updateCurrentBusinessDetails } from "../../../lib/profile-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request could not be verified. Please try again." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType?.toLowerCase() !== "application/json") {
    return NextResponse.json(
      { error: "Submit the profile as JSON." },
      { status: 415 },
    );
  }

  const payload = await request.json().catch(() => null);
  if (payload === null) {
    return NextResponse.json(
      { error: "The submitted profile is not valid JSON." },
      { status: 400 },
    );
  }

  const result = profileInputSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Check the highlighted profile details and try again.",
        issues: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  await connectToDatabase();
  const profile = await BusinessProfile.create(result.data);

  try {
    await createProfileSession(profile._id);
  } catch (error) {
    await BusinessProfile.deleteOne({ _id: profile._id });
    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request could not be verified. Please try again." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType?.toLowerCase() !== "application/json") {
    return NextResponse.json(
      { error: "Submit the business details as JSON." },
      { status: 415 },
    );
  }

  const payload = await request.json().catch(() => null);
  if (payload === null) {
    return NextResponse.json(
      { error: "The submitted business details are not valid JSON." },
      { status: 400 },
    );
  }

  const result = businessDetailsSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Check the highlighted business details and try again.",
        issues: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const updated = await updateCurrentBusinessDetails(result.data);
  if (!updated) {
    return NextResponse.json(
      { error: "Your session has expired. Please create your profile again." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
