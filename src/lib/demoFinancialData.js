const MONTH_COUNT = 6;

const CATEGORY_PATTERNS = [
  {
    matches: ["grocery", "retail", "kirana", "store"],
    revenueFactor: 0.58,
    expenseRatio: 0.72,
    growth: 0.035,
  },
  {
    matches: ["dairy", "agriculture", "farming", "milk"],
    revenueFactor: 0.52,
    expenseRatio: 0.66,
    growth: 0.025,
  },
  {
    matches: ["food processing", "processing", "manufacturing"],
    revenueFactor: 0.7,
    expenseRatio: 0.82,
    growth: 0.04,
  },
  {
    matches: ["service", "consult", "repair", "salon", "tuition"],
    revenueFactor: 0.42,
    expenseRatio: 0.48,
    growth: 0.03,
  },
];

function hashText(value) {
  return String(value || "")
    .toLowerCase()
    .split("")
    .reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 7);
}

function getPattern(user = {}) {
  const text = `${user.businessIdea || ""} ${user.businessCategory || ""}`.toLowerCase();
  return (
    CATEGORY_PATTERNS.find((pattern) =>
      pattern.matches.some((keyword) => text.includes(keyword))
    ) || {
      revenueFactor: 0.5,
      expenseRatio: 0.68,
      growth: 0.03,
    }
  );
}

function getExperienceFactor(experience = "") {
  const normalized = experience.toLowerCase();
  if (normalized.includes("experienced") || normalized.includes("expert")) return 1.12;
  if (normalized.includes("some")) return 1.04;
  return 0.94;
}

function formatMonth(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function getDemoFinancialData(user = {}) {
  const profile = user || {};
  const budget = Math.max(Number(profile.budget) || 100000, 10000);
  const pattern = getPattern(profile);
  const profileSeed = hashText(
    `${profile.businessIdea}|${profile.businessCategory}|${budget}|${profile.experience}`
  );
  const variation = 0.94 + (profileSeed % 13) / 100;
  const experienceFactor = getExperienceFactor(profile.experience);
  const start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - (MONTH_COUNT - 1));

  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const monthDate = new Date(start);
    monthDate.setMonth(start.getMonth() + index);
    const seasonalFactor = 1 + (((profileSeed + index * 7) % 9) - 4) / 100;
    const growthFactor = 1 + pattern.growth * index;
    const sales = Math.round(
      budget * pattern.revenueFactor * variation * experienceFactor * seasonalFactor * growthFactor
    );
    const expenses = Math.round(sales * pattern.expenseRatio);

    return {
      month: formatMonth(monthDate),
      sales,
      revenue: sales,
      expenses,
      profit: sales - expenses,
      isDemo: true,
    };
  });
}

export function getFinancialDataSource(records, user) {
  if (Array.isArray(records) && records.length > 0) {
    return { data: records, isDemo: false };
  }

  return { data: getDemoFinancialData(user), isDemo: true };
}

export function getDemoRiskAnalysis(financialData = [], user = {}) {
  const profile = user || {};
  const data = financialData.length > 0 ? financialData : getDemoFinancialData(user);
  const recent = data.slice(-3);
  const averageRevenue = recent.reduce((total, item) => total + Number(item.sales || item.revenue || 0), 0) / recent.length;
  const averageExpenses = recent.reduce((total, item) => total + Number(item.expenses || 0), 0) / recent.length;
  const averageProfit = recent.reduce((total, item) => total + Number(item.profit || 0), 0) / recent.length;
  const expenseRatio = averageRevenue > 0 ? averageExpenses / averageRevenue : 1;
  const profitMargin = averageRevenue > 0 ? averageProfit / averageRevenue : 0;
  const budget = Math.max(Number(profile.budget) || 0, 0);
  const cashBuffer = Math.max(0, budget - averageExpenses + averageProfit);
  const projectedRevenue = Math.round(averageRevenue * 3 * 1.03);
  const projectedExpenses = Math.round(averageExpenses * 3 * 1.03);
  const projectedProfit = projectedRevenue - projectedExpenses;
  const projectedLoss = Math.max(0, -projectedProfit);

  let riskLevel = "Low";
  if (projectedProfit < 0 || expenseRatio >= 0.85 || cashBuffer < averageExpenses) {
    riskLevel = "High";
  } else if (profitMargin < 0.2 || expenseRatio >= 0.75 || cashBuffer < averageExpenses * 2) {
    riskLevel = "Moderate";
  }

  return {
    cashBuffer: Math.round(cashBuffer),
    projectedRevenue,
    projectedExpenses,
    projectedProfit,
    projectedLoss,
    expenseRatio,
    profitMargin,
    riskLevel,
    isDemo: data.some((item) => item.isDemo),
  };
}

export function getDemoBusinessInsights(user = {}, financialData = [], simulator = null) {
  const profile = user || {};
  const data = financialData.length > 0 ? financialData : getDemoFinancialData(user);
  const risk = getDemoRiskAnalysis(data, profile);
  const category = profile.businessCategory || profile.businessIdea || "your business";
  const location = [profile.district, profile.state].filter(Boolean).join(", ");
  const isDemo = data.some((item) => item.isDemo);
  const hindi = profile.language === "hi";
  const simulatorText = simulator
    ? (hindi ? `चुनी गई स्थिति में अनुमानित लाभ ₹${Math.round(simulator.projectedProfit).toLocaleString("en-IN")} है।` : `At the selected scenario, projected profit is ₹${Math.round(simulator.projectedProfit).toLocaleString("en-IN")}.`)
    : (hindi ? `हाल का औसत मासिक लाभ ₹${Math.round(risk.projectedProfit / 3).toLocaleString("en-IN")} है।` : `The recent average monthly profit is ₹${Math.round(risk.projectedProfit / 3).toLocaleString("en-IN")}.`);

  return {
    summary: hindi ? `${location || "आपके स्थान"} में ${category} के लिए यह ${isDemo ? "नमूना" : "नियम-आधारित"} विश्लेषण ${risk.riskLevel === "Low" ? "कम" : risk.riskLevel === "High" ? "उच्च" : "मध्यम"} संचालन जोखिम दिखाता है। ${simulatorText}` : `This ${isDemo ? "sample" : "rule-based"} analysis for ${category} in ${location || "your location"} suggests a ${risk.riskLevel.toLowerCase()} operating position. ${simulatorText}`,
    opportunities: [
      hindi ? `${category} के नकद बचाव को बेहतर बनाने के लिए साप्ताहिक बिक्री और खर्च दर्ज करें।` : `Track weekly sales and expenses to improve the ${category} cash buffer.`,
      hindi ? `₹${Number(profile.budget || 0).toLocaleString("en-IN")} का अधिक बजट लगाने से पहले छोटे मूल्य या मात्रा बदलाव आजमाएं।` : `Test small pricing or volume changes before committing more of the ₹${Number(profile.budget || 0).toLocaleString("en-IN")} budget.`,
    ],
    risks: [
      hindi ? `हाल की नमूना आय में खर्च लगभग ${Math.round(risk.expenseRatio * 100)}% है।` : `Expenses use about ${Math.round(risk.expenseRatio * 100)}% of recent sample revenue.`,
      hindi ? "यह नियम-आधारित विश्लेषण है, भविष्य के परिणाम की गारंटी नहीं।" : "This is a rule-based analysis, not a guarantee about future results.",
    ],
    nextSteps: [
      isDemo
        ? (hindi ? "नमूना आधार को बदलने के लिए मासिक वित्तीय रिकॉर्ड जोड़ें।" : "Add monthly financial records to replace the sample baseline.")
        : (hindi ? "बेहतर मार्गदर्शन के लिए मासिक वित्तीय परिणाम दर्ज करते रहें।" : "Continue recording monthly financial results for more precise guidance."),
      hindi ? `${category} बढ़ाने से पहले अगले 3 महीनों की नकद जरूरत देखें।` : `Review the next 3 months of cash needs before expanding ${category}.`,
    ],
    isDemo,
  };
}
