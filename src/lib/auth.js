import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "vyaparmitra_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret() {
  return process.env.SESSION_SECRET;
}

function signUserId(userId) {
  const secret = getSessionSecret();
  if (!secret) return null;

  return createHmac("sha256", secret).update(userId).digest("hex");
}

export function createSessionToken(userId) {
  const signature = signUserId(userId);
  return signature ? `${userId}.${signature}` : null;
}

export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const [userId, signature] = token.split(".");
  if (!userId || !signature || !/^[a-f\d]{24}$/i.test(userId)) return null;

  const expectedSignature = signUserId(userId);
  if (!expectedSignature || signature.length !== expectedSignature.length) {
    return null;
  }

  const isValid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  return isValid ? userId : null;
}

export function setSessionCookie(response, userId) {
  const token = createSessionToken(userId);
  if (!token) return response;

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function sanitizeUser(user) {
  const plainUser = typeof user?.toObject === "function" ? user.toObject() : { ...user };
  delete plainUser.passwordHash;
  delete plainUser.__v;
  return plainUser;
}