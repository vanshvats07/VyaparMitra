import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const DEFAULT_SYSTEM_INSTRUCTION =
  "You are VyaparMitra AI, a practical business advisor for small business owners in India. Give clear, realistic and actionable advice based on the user's actual business information. Do not invent financial data. Keep recommendations practical and easy to understand.";

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error("AI provider request timed out");
      error.code = "TIMEOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function getText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function requestGemini(prompt, options) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const ai = new GoogleGenAI({ apiKey });
  const response = await withTimeout(
    ai.models.generateContent({
      model: options.model,
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction,
        ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
      },
    }),
    options.timeoutMs
  );
  const text = getText(response?.text);
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

async function requestGroq(prompt, options) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const groq = new Groq({ apiKey });
  const response = await withTimeout(
    groq.chat.completions.create({
      model: options.model,
      messages: [
        { role: "system", content: options.systemInstruction },
        { role: "user", content: prompt },
      ],
      ...(options.responseMimeType ? { response_format: { type: "json_object" } } : {}),
    }),
    options.timeoutMs
  );
  const text = getText(response?.choices?.[0]?.message?.content);
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}

export async function generateGeminiText(
  prompt,
  {
    timeoutMs = 15000,
    responseMimeType,
    systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
  } = {}
) {
  const geminiModel = process.env.GEMINI_MODEL;
  const groqModel = process.env.GROQ_MODEL;
  const options = { timeoutMs, responseMimeType, systemInstruction };

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { error: "not_configured" };
  }

  if (process.env.GEMINI_API_KEY && geminiModel) {
    console.log("Trying Gemini...");
    try {
      const text = await requestGemini(prompt, { ...options, model: geminiModel });
      console.log("Gemini succeeded");
      return { text, provider: "gemini" };
    } catch (error) {
      console.error("Gemini failed, trying Groq...", error?.message || "Unknown error");
    }
  } else {
    console.log("Gemini unavailable, trying Groq...");
  }

  if (process.env.GROQ_API_KEY && groqModel) {
    try {
      const text = await requestGroq(prompt, { ...options, model: groqModel });
      console.log("Groq succeeded");
      return { text, provider: "groq" };
    } catch (error) {
      console.error("Both AI providers failed", error?.message || "Unknown error");
    }
  }

  console.error("Both AI providers failed");
  return { error: "provider" };
}

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