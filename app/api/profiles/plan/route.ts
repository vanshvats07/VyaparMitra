import { NextResponse } from "next/server";
import { updateCurrentPlanningTasks } from "../../../../lib/profile-session";
import {
  isSameOriginRequest,
  readJsonBody,
} from "../../../../lib/request-security";
import { planningTasksSchema } from "../../../../lib/profile-schema";

export const runtime = "nodejs";

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
      { error: "Submit plan tasks as JSON." },
      { status: 415 },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      {
        error:
          body.reason === "too_large"
            ? "The submitted plan is too large."
            : "The submitted plan is not valid JSON.",
      },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }

  const result = planningTasksSchema.safeParse(body.value);
  if (!result.success) {
    return NextResponse.json(
      { error: "Check the plan tasks and try again." },
      { status: 422 },
    );
  }

  const updated = await updateCurrentPlanningTasks(result.data);
  if (!updated) {
    return NextResponse.json(
      { error: "Your session has expired. Please create your profile again." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
