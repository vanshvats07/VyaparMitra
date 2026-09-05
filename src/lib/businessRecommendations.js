function text(value) {
  return String(value || "").toLowerCase();
}

function getBusinessType(user) {
  const profile = `${text(user.businessIdea)} ${text(user.businessCategory)}`;

  if (/dairy|milk|cattle|farm/.test(profile)) return "dairy";
  if (/grocery|kirana|retail|shop/.test(profile)) return "retail";
  if (/food|snack|bakery|restaurant|tiffin/.test(profile)) return "food";
  if (/tailor|clothing|garment|fashion/.test(profile)) return "clothing";
  return "general";
}

function getBudgetLabel(budget) {
  const amount = Number(budget) || 0;
  if (amount < 100000) return "small starting budget";
  if (amount < 300000) return "moderate starting budget";
  return "larger starting budget";
}

export function getBusinessIdeas(user) {
  const type = getBusinessType(user);
  const budget = Number(user.budget) || 0;
  const experience = text(user.experience);
  const ideas = {
    dairy: [
      "Start with a focused dairy product range such as fresh milk, curd, or paneer.",
      "Build a nearby delivery route before investing in wider distribution.",
    ],
    retail: [
      "Start with fast-moving daily-use products suited to nearby households.",
      "Keep a simple record of frequently requested items before expanding stock.",
    ],
    food: [
      "Begin with a small menu that is easy to prepare consistently.",
      "Test pre-orders with nearby customers before adding more equipment.",
    ],
    clothing: [
      "Start with a focused range suited to local customer needs and seasons.",
      "Use samples and pre-orders to limit unsold inventory.",
    ],
    general: [
      `Refine ${user.businessIdea || "your business idea"} around one clear customer need.`,
      "Start with a small test offering and record customer feedback before expanding.",
    ],
  };

  return ideas[type].map((idea, index) => ({
    title: index === 0 ? "Recommended starting direction" : "Low-risk first step",
    description: idea,
    reason: `This suits a ${getBudgetLabel(budget)} and your ${user.experience || "current"} experience level.`,
    budgetRange: budget > 0 ? `Within your available budget of ₹${budget.toLocaleString("en-IN")}` : "Budget details are needed",
    difficulty: experience.includes("beginner")
      ? "Beginner-friendly"
      : experience.includes("advanced") || experience.includes("experienced")
        ? "Advanced planning required"
        : "Manageable with planning",
    firstSteps: [
      "Confirm the first product or service with a few nearby customers.",
      `List the equipment, supplies, and permissions needed in ${user.district || "your area"}.`,
      "Track weekly costs before increasing the scale.",
    ],
    customerType: type === "dairy" ? "Nearby households and small food businesses" : "Customers who regularly need this product or service",
    products: type === "dairy" ? "Milk, curd, or paneer" : user.businessCategory || "A focused starter product range",
  }));
}

export function getGrowthActions(user) {
  const type = getBusinessType(user);
  const localArea = user.village || user.district || "your local area";
  const productWord = type === "dairy" ? "fresh products" : type === "food" ? "your best-selling items" : "your main products";
  const budget = Number(user.budget) || 0;
  const experience = user.experience || "your current experience level";

  return [
    {
      title: "Build repeat customers",
      description: `Keep a simple customer list in ${localArea} and follow up after purchases of ${productWord}. Start with a routine that suits ${experience} experience.`,
      impact: "High Impact",
    },
    {
      title: "Improve local visibility",
      description: `Share clear prices, timings, and contact details through WhatsApp and local community groups in ${user.district}. Keep promotion spending within your ₹${budget.toLocaleString("en-IN")} budget.`,
      impact: "Medium Effort",
    },
    {
      title: "Expand carefully",
      description: `Use customer requests to choose the next ${type === "retail" ? "products" : "service or product"} instead of spending the full budget at once.`,
      impact: "Growth",
    },
  ];
}

export function getBusinessStrategy(user) {
  const type = getBusinessType(user);
  const customer = type === "dairy" ? "nearby households and small food businesses" : type === "retail" ? "nearby households and repeat local buyers" : "customers within easy reach of your location";
  const pricingFocus = type === "dairy" ? "freshness, delivery, and spoilage costs" : type === "retail" ? "stock turnover and small per-item margins" : "material costs, time, and repeat demand";

  return {
    targetCustomer: customer,
    pricing: `For this ${type} business, compare nearby prices while tracking ${pricingFocus}. Include delivery or packaging costs and keep a margin customers can understand.`,
    positioning: `Position ${user.businessIdea || "the business"} around reliability, consistent quality, and convenient service for ${customer}.`,
    monthlyPlan: `Set one ${type} customer goal, one sales activity, and one expense review each month while learning from your ${user.experience || "current"} experience level.`,
    expenseControl: `Protect the available budget of ₹${(Number(user.budget) || 0).toLocaleString("en-IN")} by testing demand before buying equipment or large inventory.`,
    revenueAction: `Offer a simple repeat-purchase option for ${type === "food" ? "popular items" : "your regular customers"}.`,
    budgetAllocation: [
      { name: "Inventory or supplies", percentage: 40, amount: Math.round((Number(user.budget) || 0) * 0.4) },
      { name: "Equipment and setup", percentage: 20, amount: Math.round((Number(user.budget) || 0) * 0.2) },
      { name: "Local marketing", percentage: 10, amount: Math.round((Number(user.budget) || 0) * 0.1) },
      { name: "Working capital", percentage: 20, amount: Math.round((Number(user.budget) || 0) * 0.2) },
      { name: "Emergency reserve", percentage: 10, amount: Math.round((Number(user.budget) || 0) * 0.1) },
    ],
    firstThirtyDays: [
      "Speak with potential customers and confirm the first offer.",
      "Record every setup and operating expense.",
      "Review customer feedback and repeat-purchase interest at the end of the month.",
    ],
  };
}

export function getLocationStrategy(user) {
  const place = [user.village, user.district, user.state].filter(Boolean).join(", ") || "your chosen area";
  const type = getBusinessType(user);
  const businessConsideration = type === "dairy"
    ? "Prioritize water access, clean storage, feed or supply access, and a practical route to customers."
    : type === "retail"
      ? "Prioritize nearby households, visible foot traffic, easy loading, and regular supplier access."
      : "Prioritize customer access, suitable storage, and a location that supports the way this business serves people.";

  return {
    area: `Prioritize an area in or near ${place} where your target customers already travel regularly.`,
    customers: `${businessConsideration} Choose visibility and customer convenience over a distant location that is difficult to reach.`,
    suppliers: "Check supplier distance, delivery frequency, storage needs, and transport costs before committing to a location.",
    competition: "Visit nearby competitors at different times and look for an unmet customer need rather than assuming low competition is always better.",
    cost: "Compare rent, utilities, transport, and setup costs together; keep enough budget for day-to-day operations.",
    storage: "Check whether the business needs dry, cold, secure, or customer-accessible storage before choosing the space.",
    visibility: "Prefer a visible, easy-to-reach spot when walk-in customers are important, but compare the total cost first.",
  };
}