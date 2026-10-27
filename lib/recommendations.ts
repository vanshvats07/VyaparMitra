import { formatBudget } from "./format-budget.ts";
import type { ProfileInput } from "./profile-schema";
import type { SupportedLanguage } from "./profile-options";

type RecommendationProfile = Pick<
  ProfileInput,
  "businessStatus" | "businessCategory" | "availableBudget" | "experienceLevel"
>;

export function buildFirstSteps(
  profile: RecommendationProfile,
  language: SupportedLanguage,
): string[] {
  const isHindi = language === "hi";
  const marketStep =
    profile.businessStatus === "planning"
      ? isHindi
        ? "अपने इलाके के संभावित ग्राहकों से बात करें और समझें कि उन्हें किस चीज़ की ज़रूरत है।"
        : "Talk with potential customers nearby to understand what they need."
      : isHindi
        ? "अपने मौजूदा ग्राहकों से पूछें कि वे किस चीज़ को बेहतर देखना चाहते हैं।"
        : "Ask your current customers what they would like you to improve.";

  const categorySteps = {
    agriculture: {
      en: "Check local growing conditions, input costs, and where you could sell before investing.",
      hi: "निवेश से पहले स्थानीय खेती की परिस्थितियाँ, लागत और बिक्री के संभावित स्थान जाँचें।",
    },
    food: {
      en: "Try a small set of products and calculate ingredient and packaging costs for each.",
      hi: "कुछ उत्पादों से शुरुआत करके हर उत्पाद की सामग्री और पैकिंग की लागत निकालें।",
    },
    retail: {
      en: "List the everyday items people nearby ask for and compare local supplier prices.",
      hi: "आसपास के लोगों की रोज़मर्रा की ज़रूरतें लिखें और स्थानीय सप्लायर के दाम तुलना करें।",
    },
    services: {
      en: "Describe the service clearly, then ask potential customers what they would pay for it.",
      hi: "अपनी सेवा को साफ़ शब्दों में बताएँ और संभावित ग्राहकों से उचित कीमत पूछें।",
    },
    manufacturing: {
      en: "Estimate raw-material and production costs, and test a small sample before scaling.",
      hi: "कच्चे माल और उत्पादन की लागत निकालें और विस्तार से पहले छोटा नमूना जाँचें।",
    },
    other: {
      en: "Write down the specific problem your idea solves and who would benefit from it.",
      hi: "लिखें कि आपका विचार कौन-सी समस्या हल करता है और किसे इससे लाभ होगा।",
    },
  }[profile.businessCategory];

  const experienceStep =
    profile.experienceLevel === "beginner"
      ? isHindi
        ? "हर शुरुआती खर्च लिखें और बड़ी खरीदारी से पहले छोटे स्तर पर विचार जाँचें।"
        : "Write down each startup cost and test the idea on a small scale before major purchases."
      : profile.experienceLevel === "some"
        ? isHindi
          ? "अपने पिछले अनुभव से बिक्री, खर्च और ग्राहक प्रतिक्रिया के नोट्स देखें।"
          : "Use notes from your past experience to compare sales, costs, and customer feedback."
        : isHindi
          ? "अपने पुराने व्यवसाय से मिले बिक्री और लागत के आँकड़ों को इस विचार से तुलना करें।"
          : "Compare this idea with sales and cost records from businesses you have run before.";

  const budgetStep = isHindi
    ? `अपना शुरुआती बजट ${formatBudget(profile.availableBudget)} तक रखें और नियमित खर्चों के लिए भी राशि अलग सोचें।`
    : `Plan within your ${formatBudget(profile.availableBudget)} budget and account for ongoing costs as well.`;

  return [marketStep, categorySteps[isHindi ? "hi" : "en"], experienceStep, budgetStep];
}
