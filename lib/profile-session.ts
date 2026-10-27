import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Types } from "mongoose";
import { BusinessProfile } from "../models/BusinessProfile";
import { ProfileSession } from "../models/ProfileSession";
import { connectToDatabase } from "./mongodb";

const SESSION_COOKIE_NAME = "vyaparmitra_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createProfileSession(
  profileId: Types.ObjectId,
): Promise<void> {
  await connectToDatabase();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await ProfileSession.create({
    profileId,
    sessionTokenHash: hashSessionToken(token),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getCurrentProfile() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  await connectToDatabase();

  const session = await ProfileSession.findOne({
    sessionTokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  })
    .select("profileId")
    .lean();

  if (!session) {
    return null;
  }

  const profile = await BusinessProfile.findById(session.profileId)
    .select(
      "_id fullName state district village preferredLanguage businessStatus businessIdea businessCategory availableBudget experienceLevel",
    )
    .lean();

  if (!profile) {
    return null;
  }

  return {
    id: profile._id.toString(),
    fullName: profile.fullName,
    state: profile.state,
    district: profile.district,
    village: profile.village,
    preferredLanguage: profile.preferredLanguage,
    businessStatus: profile.businessStatus,
    businessIdea: profile.businessIdea,
    businessCategory: profile.businessCategory,
    availableBudget: profile.availableBudget,
    experienceLevel: profile.experienceLevel,
  };
}

export async function revokeCurrentProfileSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await connectToDatabase();
    await ProfileSession.deleteOne({
      sessionTokenHash: hashSessionToken(token),
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
