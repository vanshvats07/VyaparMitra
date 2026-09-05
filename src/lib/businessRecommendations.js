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

export function getGrowthActions(user, metrics = []) {
  const type = getBusinessType(user);
  const localArea = user.village || user.district || "your local area";
  const productWord = type === "dairy" ? "fresh products" : type === "food" ? "your best-selling items" : "your main products";
  const budget = Number(user.budget) || 0;
  const experience = user.experience || "your current experience level";
  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  const salesAreDeclining = latestMetric && previousMetric && latestMetric.sales < previousMetric.sales;
  const expensesAreHigh = latestMetric && latestMetric.sales > 0 && latestMetric.expenses / latestMetric.sales > 0.7;
  const isBeginner = text(user.experience).includes("beginner");
  const customerDetail = type === "dairy"
    ? `List nearby households, milk buyers, restaurants, and sweet shops in ${localArea}. Start by asking regular buyers about preferred delivery times.`
    : type === "retail"
      ? `List nearby households, offices, hostels, or apartments in ${localArea}. Record frequently requested products before expanding stock.`
      : `List residential and commercial customers in ${localArea} who need ${productWord}. Ask existing contacts for referrals.`;
  const salesDetail = type === "dairy"
    ? "Offer a reliable repeat-order or subscription routine for milk and related products without promising a fixed return."
    : type === "retail"
      ? "Group fast-moving products, offer convenient ordering, and follow up with repeat buyers while protecting your margin."
      : "Identify the most requested product or service, improve its visibility, and test a small bundle or repeat-service option.";
  const marketingDetail = isBeginner
    ? `Start with a WhatsApp Business profile, clear product photos, timings, and customer reviews from ${localArea}.`
    : `Use WhatsApp Business, a Google Business Profile, local reviews, and simple social posts targeted to customers near ${user.district || "your district"}.`;
  const actions = [
    {
      cardTitle: "Find Customers",
      title: type === "dairy" ? "Build repeat dairy customers" : type === "retail" ? "Reach nearby household buyers" : "Build a local customer list",
      description: salesAreDeclining
        ? `Sales are lower in the latest recorded period, so focus first on reaching likely customers in ${localArea}.`
        : `Build a customer list in ${localArea} and follow up after purchases of ${productWord}. Start with a routine that suits ${experience} experience.`,
      impact: salesAreDeclining ? "High Priority" : "High Impact",
      category: "Customers",
      effort: "Start this week",
      detail: `Why it helps: knowing who to contact makes follow-up more consistent.\n\nFirst actions:\n1. ${customerDetail}\n2. Record name, contact preference, product need, and follow-up date.\n3. Review the list weekly and remove information the customer did not agree to share.`,
    },
    {
      cardTitle: "Increase Sales",
      title: type === "dairy" ? "Create a reliable delivery routine" : type === "retail" ? "Promote fast-moving products" : "Improve repeat purchases",
      description: expensesAreHigh
        ? "Expenses are a large share of the latest recorded sales, so improve repeat sales without adding unnecessary stock or spending."
        : `Use customer requests to improve ${productWord}, offer sensible bundles, and follow up with repeat buyers within your ₹${budget.toLocaleString("en-IN")} budget.`,
      impact: expensesAreHigh ? "Review Costs" : "Medium Effort",
      category: "Pricing",
      effort: "Review monthly",
      detail: `Why it helps: small improvements to repeat purchases and product visibility can support growth without promising a guaranteed increase.\n\nFirst actions:\n1. ${salesDetail}\n2. Compare nearby prices and include packaging, delivery, and operating costs.\n3. Track sales and expenses before repeating the offer.`,
    },
    {
      cardTitle: "Digital Marketing",
      title: type === "dairy" ? "Partner with nearby food shops" : type === "retail" ? "Start WhatsApp ordering" : "Build a simple digital presence",
      description: `Use practical digital promotion for ${user.businessCategory || user.businessIdea || "your business"} in ${user.district || "your area"}, within your available budget.`,
      impact: isBeginner ? "Easy Start" : "Growth",
      category: "Marketing",
      effort: isBeginner ? "Start this week" : "Build monthly",
      detail: `Why it helps: customers can find accurate business information before contacting you.\n\nFirst actions:\n1. ${marketingDetail}\n2. Add correct location, hours, contact details, and current products or services.\n3. Ask satisfied customers for honest reviews; do not publish private customer information without permission.`,
    },
  ];

  return actions;
}

export function getGrowthTip(user, metrics = []) {
  const type = getBusinessType(user);
  const useHindi = user.language === "hi";
  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  const salesAreDeclining = latestMetric && previousMetric && latestMetric.sales < previousMetric.sales;
  const salesAreGrowing = latestMetric && previousMetric && latestMetric.sales > previousMetric.sales;
  const expensesAreGrowing = latestMetric && previousMetric && latestMetric.expenses > previousMetric.expenses;
  const latestMargin = latestMetric?.sales > 0 ? latestMetric.profit / latestMetric.sales : null;
  const previousMargin = previousMetric?.sales > 0 ? previousMetric.profit / previousMetric.sales : null;
  const marginIsImproving = latestMargin !== null && previousMargin !== null && latestMargin > previousMargin;
  const budget = Number(user.budget) || 0;
  const isBeginner = text(user.experience).includes("beginner");
  const budgetAdvice = budget < 100000
    ? (useHindi ? "कम लागत वाले कदमों से शुरू करें और खर्च दर्ज करें।" : "Start with low-cost actions and record each expense.")
    : (useHindi ? "विस्तार से पहले छोटे परीक्षण करें और बजट का कुछ हिस्सा सुरक्षित रखें।" : "Test expansion in small steps and keep part of the budget reserved.");

  if (salesAreDeclining) {
    return {
      title: useHindi ? "बिक्री सुधार पर ध्यान दें" : "Focus on sales recovery",
      subtitle: useHindi ? "हाल के बिक्री रिकॉर्ड के आधार पर" : "Based on your recent sales records",
      tip: useHindi
        ? `${user.district || "अपने क्षेत्र"} में पुराने ग्राहकों से संपर्क करें, कमजोर उत्पादों की समीक्षा करें और नए खर्च से पहले प्रतिक्रिया लें।`
        : `Contact previous customers in ${user.district || "your area"}, review weaker products, and collect feedback before adding new spending.`,
    };
  }

  if (expensesAreGrowing) {
    return {
      title: useHindi ? "खर्च की समीक्षा करें" : "Review rising expenses",
      subtitle: useHindi ? "हाल के खर्च रिकॉर्ड के आधार पर" : "Based on your recent expense records",
      tip: useHindi
        ? "जरूरी और टाले जा सकने वाले खर्च अलग करें। बिक्री बढ़ने से पहले अनावश्यक स्टॉक या उपकरण न जोड़ें।"
        : "Separate essential and avoidable costs. Avoid adding stock or equipment before you understand the extra expense.",
    };
  }

  if (marginIsImproving || salesAreGrowing) {
    return {
      title: useHindi ? "जो काम कर रहा है उसे दोहराएं" : "Repeat what is working",
      subtitle: useHindi ? "हाल के व्यापार रिकॉर्ड के आधार पर" : "Based on your recent business records",
      tip: useHindi
        ? `${user.businessCategory || user.businessIdea || "इस व्यवसाय"} में बेहतर परिणाम देने वाले उत्पाद या सेवा को छोटे कदमों में बढ़ाएं।`
        : `Scale the product or service performing better for ${user.businessCategory || user.businessIdea || "this business"} in small, controlled steps.`,
    };
  }

  if (type === "dairy") {
    return {
      title: useHindi ? "दूध के नियमित ग्राहकों पर ध्यान दें" : "Focus on repeat dairy buyers",
      subtitle: useHindi ? "आपके डेयरी प्रोफाइल के आधार पर" : "Based on your dairy business profile",
      tip: useHindi
        ? `नियमित ग्राहकों और आसपास की दुकानों के लिए भरोसेमंद डिलीवरी या संग्रह व्यवस्था बनाएं। ${budgetAdvice}`
        : `Build a reliable delivery or collection routine for regular customers and nearby shops. ${budgetAdvice}`,
    };
  }

  if (type === "retail") {
    return {
      title: useHindi ? "तेजी से बिकने वाले सामान पर ध्यान दें" : "Track fast-moving products",
      subtitle: useHindi ? "आपकी रिटेल प्रोफाइल के आधार पर" : "Based on your retail business profile",
      tip: useHindi
        ? `सबसे ज्यादा मांग वाले सामान की सूची बनाएं और पुराने ग्राहकों को दोबारा खरीदने की याद दिलाएं। ${budgetAdvice}`
        : `List the products customers buy most often and remind repeat customers before adding slower-moving stock. ${budgetAdvice}`,
    };
  }

  if (type === "food") {
    return {
      title: useHindi ? "लोकप्रिय खाद्य उत्पादों को बेहतर बनाएं" : "Improve your popular food items",
      subtitle: useHindi ? "आपकी खाद्य व्यवसाय प्रोफाइल के आधार पर" : "Based on your food business profile",
      tip: useHindi
        ? `लोकप्रिय उत्पादों की गुणवत्ता एक जैसी रखें और प्री-ऑर्डर से बर्बादी कम करें। ${budgetAdvice}`
        : `Keep popular products consistent and use pre-orders to reduce avoidable waste. ${budgetAdvice}`,
    };
  }

  if (type === "clothing") {
    return {
      title: useHindi ? "ग्राहक की पसंद से नया स्टॉक चुनें" : "Choose new stock from customer requests",
      subtitle: useHindi ? "आपकी कपड़ों की व्यवसाय प्रोफाइल के आधार पर" : "Based on your clothing business profile",
      tip: useHindi
        ? "सैंपल और ग्राहक की मांग देखकर नया स्टॉक चुनें ताकि बिना बिके माल का जोखिम कम हो।"
        : "Use samples and customer requests to guide new stock and reduce unsold inventory.",
    };
  }

  return {
    title: useHindi ? "एक आसान ग्राहक कदम से शुरू करें" : "Start with one repeatable customer action",
    subtitle: useHindi ? "आपकी व्यवसाय प्रोफाइल के आधार पर" : "Based on your business profile",
    tip: useHindi
      ? `${user.village || user.district || "अपने क्षेत्र"} में एक ग्राहक संपर्क कदम चुनें और हर सप्ताह उसका परिणाम दर्ज करें। ${isBeginner ? "सरल कदमों से शुरुआत करें।" : budgetAdvice}`
      : `Choose one customer action in ${user.village || user.district || "your area"} and track the result each week. ${isBeginner ? "Start with simple steps." : budgetAdvice}`,
  };
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