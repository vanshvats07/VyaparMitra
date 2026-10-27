import assert from "node:assert/strict";
import test from "node:test";
import {
  isSameOriginRequest,
  readJsonBody,
} from "../lib/request-security.ts";

test("accepts only requests with a matching Origin", () => {
  const sameOrigin = new Request("https://vyaparmitra.example/api/profiles", {
    headers: { origin: "https://vyaparmitra.example" },
  });
  const crossOrigin = new Request("https://vyaparmitra.example/api/profiles", {
    headers: { origin: "https://untrusted.example" },
  });
  const missingOrigin = new Request("https://vyaparmitra.example/api/profiles");

  assert.equal(isSameOriginRequest(sameOrigin), true);
  assert.equal(isSameOriginRequest(crossOrigin), false);
  assert.equal(isSameOriginRequest(missingOrigin), false);
});

test("reads bounded JSON and rejects malformed or oversized bodies", async () => {
  const valid = new Request("https://vyaparmitra.example/api/profiles", {
    method: "POST",
    body: JSON.stringify({ fullName: "Asha" }),
  });
  const malformed = new Request("https://vyaparmitra.example/api/profiles", {
    method: "POST",
    body: "{invalid",
  });
  const oversized = new Request("https://vyaparmitra.example/api/profiles", {
    method: "POST",
    body: "x".repeat(32 * 1024 + 1),
  });

  assert.deepEqual(await readJsonBody(valid), {
    ok: true,
    value: { fullName: "Asha" },
  });
  assert.deepEqual(await readJsonBody(malformed), {
    ok: false,
    reason: "invalid",
  });
  assert.deepEqual(await readJsonBody(oversized), {
    ok: false,
    reason: "too_large",
  });
});
