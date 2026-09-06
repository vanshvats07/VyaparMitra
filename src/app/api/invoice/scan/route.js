import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthenticatedUserId } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const INVOICE_PROMPT = `You are an invoice extraction assistant for VyaparMitra. Read the uploaded invoice carefully and extract only information that is actually visible. Never guess missing values. Return valid JSON only.

Return exactly this shape:
{
  "invoiceType": "sale",
  "vendorName": "",
  "customerName": "",
  "invoiceNumber": "",
  "invoiceDate": "",
  "items": [{ "name": "", "quantity": 0, "unitPrice": 0, "total": 0 }],
  "subtotal": 0,
  "tax": 0,
  "totalAmount": 0,
  "currency": "INR",
  "category": "",
  "confidence": 0
}

Classify the document as "sale" when the business is issuing an invoice to a customer. Classify it as "purchase" when the business is receiving an invoice from a supplier for goods or services it bought. A sales invoice is issued by the business to a customer when the business sells products or services. A purchase invoice is received from a supplier when the business buys products, materials, or services. If the document is genuinely ambiguous, use "unknown" and do not guess.
For a sale, vendorName is the seller/business and customerName is the buyer. For a purchase, vendorName is the supplier and customerName may be null.
Use null or an empty value when a field is not visible. Monetary values and quantities must be numbers when visible. Confidence must be a number from 0 to 100.`;

function parseJson(text) {
  const cleanedText = String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    return null;
  }
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalizeExtraction(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return null;

  const items = value.items.map((item) => ({
    name: typeof item?.name === "string" ? item.name.trim() : "",
    quantity: numberOrNull(item?.quantity),
    unitPrice: numberOrNull(item?.unitPrice),
    total: numberOrNull(item?.total),
  }));
  const confidence = numberOrNull(value.confidence);
  const normalizedInvoiceType = typeof value.invoiceType === "string"
    ? value.invoiceType.trim().toLowerCase()
    : "unknown";
  const invoiceType = ["sale", "purchase", "unknown"].includes(normalizedInvoiceType)
    ? normalizedInvoiceType
    : "unknown";

  return {
    invoiceType,
    vendorName: typeof value.vendorName === "string" ? value.vendorName.trim() : "",
    customerName: typeof value.customerName === "string" ? value.customerName.trim() : "",
    invoiceNumber: typeof value.invoiceNumber === "string" ? value.invoiceNumber.trim() : "",
    invoiceDate: typeof value.invoiceDate === "string" ? value.invoiceDate.trim() : "",
    items,
    subtotal: numberOrNull(value.subtotal),
    tax: numberOrNull(value.tax),
    totalAmount: numberOrNull(value.totalAmount),
    currency: typeof value.currency === "string" && value.currency.trim() ? value.currency.trim() : "INR",
    category: typeof value.category === "string" ? value.category.trim() : "",
    confidence: confidence === null ? 0 : Math.min(100, confidence),
  };
}

export async function POST(request) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId();
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, message: "Please log in to scan an invoice." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ success: false, message: "Please upload an invoice file." }, { status: 400 });
    }
    if (!SUPPORTED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, message: "Please upload a JPG, PNG, or supported PDF invoice." }, { status: 415 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "This file is too large. Please upload a file under 10 MB." }, { status: 413 });
    }
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
      return NextResponse.json({ success: false, message: "The invoice scanner is temporarily unavailable." }, { status: 503 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await Promise.race([
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: [{
          role: "user",
          parts: [
            { text: INVOICE_PROMPT },
            { inlineData: { mimeType: file.type, data: bytes.toString("base64") } },
          ],
        }],
        config: { responseMimeType: "application/json" },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Invoice scan timed out")), 30000)),
    ]);

    const extraction = normalizeExtraction(parseJson(response?.text));
    if (!extraction) {
      return NextResponse.json({ success: false, message: "Couldn't read this invoice. Please upload a clearer image." }, { status: 422 });
    }

    return NextResponse.json({ success: true, invoice: extraction });
  } catch (error) {
    console.error("Invoice scan error:", error?.message || "Unknown error");
    return NextResponse.json({ success: false, message: "The invoice scanner is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
