const PROFILE_FIELDS = ["name", "phone", "state", "district", "businessIdea", "businessCategory", "budget", "experience"];

function hasValue(value) {
  if (value === undefined || value === null) return false;
  const normalizedValue = String(value).trim().toLowerCase();
  return normalizedValue !== "" && normalizedValue !== "not provided" && normalizedValue !== "n/a";
}

function getRecordProfit(record) {
  const sales = Number(record?.sales || 0);
  const expenses = Number(record?.expenses || 0);
  return Number.isFinite(Number(record?.profit)) ? Number(record.profit) : sales - expenses;
}

function getProfileScore(user) {
  const profile = user || {};
  const completedFields = PROFILE_FIELDS.filter((field) => {
    if (field === "budget") return Number.isFinite(Number(profile.budget)) && Number(profile.budget) > 0;
    return hasValue(profile[field]);
  }).length;
  return {
    score: Math.round((completedFields / PROFILE_FIELDS.length) * 20),
    completion: Math.round((completedFields / PROFILE_FIELDS.length) * 100),
  };
}

function getFinancialHealthScore(records) {
  if (records.length === 0) return { score: 0, totalSales: 0, totalExpenses: 0, totalProfit: 0 };
  const totalSales = records.reduce((total, record) => total + Number(record.sales || 0), 0);
  const totalExpenses = records.reduce((total, record) => total + Number(record.expenses || 0), 0);
  const totalProfit = totalSales - totalExpenses;
  if (totalSales <= 0) return { score: 0, totalSales, totalExpenses, totalProfit };

  const profitMargin = (totalProfit / totalSales) * 100;
  let score = profitMargin >= 30 ? 40 : profitMargin >= 20 ? 34 : profitMargin >= 10 ? 27 : profitMargin >= 5 ? 18 : profitMargin >= 0 ? 10 : Math.max(0, Math.round(5 + profitMargin / 10));
  if (getRecordProfit(records[records.length - 1]) < 0) score -= 5;
  if (records.length >= 3 && records.slice(-3).every((record) => getRecordProfit(record) < 0)) score -= 8;
  if (records.length >= 2) {
    const recentProfits = records.slice(-3).map(getRecordProfit);
    if (recentProfits.every((profit, index) => index === 0 || profit > recentProfits[index - 1])) score += 2;
  }
  return { score: Math.max(0, Math.min(40, score)), totalSales, totalExpenses, totalProfit };
}

function getStabilityScore(records) {
  if (records.length === 0) return 0;
  const profits = records.slice(-3).map(getRecordProfit);
  const negativeCount = profits.filter((profit) => profit < 0).length;
  if (negativeCount === profits.length) return 2;
  if (negativeCount > 0) return 8;
  if (profits.every((profit) => profit > 0)) return 20;
  return 12;
}

function getBudgetScore(user, financialHealth) {
  const budget = Number(user?.budget);
  if (!Number.isFinite(budget) || budget <= 0) return 0;
  if (financialHealth.totalExpenses <= 0) return 5;
  return Math.min(10, Math.max(1, Math.round((budget / financialHealth.totalExpenses) * 2)));
}

function getExperienceScore(user) {
  const experience = String(user?.experience || "").toLowerCase();
  if (!hasValue(experience)) return 0;
  if (experience.includes("experienced") || experience.includes("expert") || experience.includes("good")) return 10;
  if (experience.includes("some") || experience.includes("intermediate")) return 6;
  return 3;
}

export function calculateBusinessReadiness(user = {}, financialRecords = []) {
  const records = Array.isArray(financialRecords) ? financialRecords : [];
  const profile = getProfileScore(user);
  const financialHealth = getFinancialHealthScore(records);
  const factors = {
    profile: profile.score,
    financialHealth: financialHealth.score,
    stability: getStabilityScore(records),
    budget: getBudgetScore(user, financialHealth),
    experience: getExperienceScore(user),
  };
  const readinessScore = Math.max(0, Math.min(100, Object.values(factors).reduce((total, score) => total + score, 0)));
  return { profileCompletion: profile.completion, readinessScore, financialRecordCount: records.length, factors };
}

export function getReadinessLabel(score) {
  if (score >= 90) return "Business Ready";
  if (score >= 75) return "Good Foundation";
  if (score >= 60) return "Moderate Readiness";
  if (score >= 40) return "Getting Started";
  return "Needs Attention";
}