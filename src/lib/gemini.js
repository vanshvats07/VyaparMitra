export function parseGeminiJson(text) {
  const withoutCodeFence = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutCodeFence);
  } catch {
    return null;
  }
}

export async function generateGeminiText(
  prompt,
  { timeoutMs = 30000, responseMimeType } = {}
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "not_configured" };
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const requestBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (responseMimeType) {
    requestBody.generationConfig = { responseMimeType };
  }

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
  } catch (error) {
    return {
      error: error?.name === "TimeoutError" ? "timeout" : "provider",
    };
  }

  if (!response.ok) {
    return { error: "provider", status: response.status };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { error: "malformed" };
  }
  const parts = data.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return { error: "malformed" };
  }

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();

  return text ? { text } : { error: "empty" };
}