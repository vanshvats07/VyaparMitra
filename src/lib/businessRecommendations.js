import { normalizeLanguage, translate } from "@/lib/translations";

function text(value) {
  return String(value || "").toLowerCase();
}

function languageOf(user) {
  return normalizeLanguage(user?.language);
}

function getBusinessType(user) {
  const profile = `${text(user.businessIdea)} ${text(user.businessCategory)}`;
  if (/dairy|milk|cattle|farm/.test(profile)) return "dairy";
  if (/grocery|kirana|retail|shop/.test(profile)) return "retail";
  if (/food|snack|bakery|restaurant|tiffin/.test(profile)) return "food";
  if (/tailor|clothing|garment|fashion/.test(profile)) return "clothing";
  return "general";
}

function getBudgetLabel(budget, language) {
  if (budget < 100000) return language === "hi" ? "कम शुरुआती बजट" : "small starting budget";
  if (budget < 300000) return language === "hi" ? "मध्यम शुरुआती बजट" : "moderate starting budget";
  return language === "hi" ? "बड़ा शुरुआती बजट" : "larger starting budget";
}

export function getBusinessIdeas(user) {
  const language = languageOf(user);
  const hindi = language === "hi";
  const type = getBusinessType(user);
  const budget = Number(user.budget) || 0;
  const experience = text(user.experience);
  const ideas = {
    dairy: hindi ? ["ताजे दूध, दही या पनीर जैसे सीमित डेयरी उत्पादों से शुरुआत करें।", "विस्तृत वितरण में निवेश करने से पहले आसपास डिलीवरी मार्ग बनाएं।"] : ["Start with a focused dairy product range such as fresh milk, curd, or paneer.", "Build a nearby delivery route before investing in wider distribution."],
    retail: hindi ? ["आसपास के परिवारों की जरूरत के अनुसार रोजमर्रा के तेजी से बिकने वाले सामान से शुरुआत करें।", "स्टॉक बढ़ाने से पहले अक्सर मांगे जाने वाले सामान का सरल रिकॉर्ड रखें।"] : ["Start with fast-moving daily-use products suited to nearby households.", "Keep a simple record of frequently requested items before expanding stock."],
    food: hindi ? ["ऐसे छोटे मेनू से शुरुआत करें जिसे हर बार एक जैसा बनाना आसान हो।", "अधिक उपकरण जोड़ने से पहले आसपास के ग्राहकों से प्री-ऑर्डर आजमाएं।"] : ["Begin with a small menu that is easy to prepare consistently.", "Test pre-orders with nearby customers before adding more equipment."],
    clothing: hindi ? ["स्थानीय ग्राहकों की जरूरत और मौसम के अनुसार सीमित कपड़ों से शुरुआत करें।", "बिना बिके स्टॉक को सीमित करने के लिए नमूने और प्री-ऑर्डर का उपयोग करें।"] : ["Start with a focused range suited to local customer needs and seasons.", "Use samples and pre-orders to limit unsold inventory."],
    general: hindi ? [`${user.businessIdea || "अपने व्यवसाय विचार"} को एक स्पष्ट ग्राहक जरूरत के अनुसार बेहतर बनाएं।`, "छोटी पेशकश आजमाएं और विस्तार से पहले ग्राहक प्रतिक्रिया दर्ज करें।"] : [`Refine ${user.businessIdea || "your business idea"} around one clear customer need.`, "Start with a small test offering and record customer feedback before expanding."],
  };
  const area = user.district || (hindi ? "अपने क्षेत्र" : "your area");
  const firstSteps = translate(language, "recommendations.firstSteps").map((step) => step.replace("{area}", area));
  return ideas[type].map((description, index) => ({
    title: translate(language, index === 0 ? "recommendations.recommendedDirection" : "recommendations.lowRisk"),
    description,
    reason: hindi ? `यह ${getBudgetLabel(budget, language)} और आपके ${user.experience || "वर्तमान"} अनुभव के अनुसार है।` : `This suits a ${getBudgetLabel(budget, language)} and your ${user.experience || "current"} experience level.`,
    budgetRange: budget > 0 ? translate(language, "recommendations.withinBudget", { amount: budget.toLocaleString("en-IN") }) : translate(language, "recommendations.budgetNeeded"),
    difficulty: experience.includes("beginner") ? translate(language, "recommendations.beginner") : experience.includes("advanced") || experience.includes("experienced") ? translate(language, "recommendations.advanced") : translate(language, "recommendations.manageable"),
    firstSteps,
    customerType: type === "dairy" ? translate(language, "recommendations.nearbyCustomers") : translate(language, "recommendations.regularCustomers"),
    products: type === "dairy" ? (hindi ? "दूध, दही या पनीर" : "Milk, curd, or paneer") : user.businessCategory || (hindi ? "सीमित शुरुआती उत्पाद" : "A focused starter product range"),
  }));
}

export function getGrowthActions(user, metrics = []) {
  const language = languageOf(user);
  const hindi = language === "hi";
  const type = getBusinessType(user);
  const area = user.village || user.district || (hindi ? "अपने क्षेत्र" : "your local area");
  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];
  const declining = latest && previous && latest.sales < previous.sales;
  const highExpenses = latest && latest.sales > 0 && latest.expenses / latest.sales > 0.7;
  const beginner = text(user.experience).includes("beginner");
  const g = (key) => translate(language, `recommendations.growth.${key}`);
  const names = type === "dairy" ? [g("buildRepeat"), g("delivery"), g("partnerShops")] : type === "retail" ? [g("reachHouseholds"), g("fastMoving"), g("whatsapp")] : [g("localList"), g("repeatPurchases"), g("digitalPresence")];
  const cards = [g("findCustomers"), g("increaseSales"), g("digitalMarketing")];
  const customerDetail = hindi ? `${area} में संभावित ग्राहकों की सूची बनाएं और अक्सर मांगे जाने वाले उत्पाद दर्ज करें।` : `List likely customers in ${area} and record frequently requested products before expanding stock.`;
  const marketingDetail = beginner ? (hindi ? `${area} के लिए व्हाट्सऐप बिजनेस प्रोफ़ाइल, साफ उत्पाद तस्वीरें, समय और ग्राहक समीक्षा जोड़ें।` : `Start with a WhatsApp Business profile, clear product photos, timings, and customer reviews from ${area}.`) : (hindi ? "व्हाट्सऐप बिजनेस, गूगल बिजनेस प्रोफ़ाइल, स्थानीय समीक्षा और सरल सोशल पोस्ट का उपयोग करें।" : "Use WhatsApp Business, a Google Business Profile, local reviews, and simple social posts.");
  return cards.map((cardTitle, index) => {
    const description = index === 0 ? (declining ? (hindi ? `हाल की बिक्री कम हुई है, इसलिए ${area} में संभावित ग्राहकों तक पहले पहुंचें।` : `Sales are lower recently, so focus first on reaching likely customers in ${area}.`) : (hindi ? `${area} में ग्राहक सूची बनाएं और खरीद के बाद संपर्क करें।` : `Build a customer list in ${area} and follow up after purchases.`)) : index === 1 ? (highExpenses ? (hindi ? "हाल की बिक्री में खर्च का हिस्सा अधिक है, इसलिए बिना अतिरिक्त स्टॉक या खर्च के दोबारा बिक्री बढ़ाएं।" : "Expenses are a large share of recent sales, so improve repeat sales without adding unnecessary stock or spending.") : (hindi ? "ग्राहक मांग समझें, उचित पैकेज दें और दोबारा खरीदने वाले ग्राहकों से संपर्क करें।" : "Use customer requests, offer sensible bundles, and follow up with repeat buyers.")) : (hindi ? `${user.businessCategory || user.businessIdea || "अपने व्यवसाय"} के लिए व्यावहारिक डिजिटल प्रचार करें।` : `Use practical digital promotion for ${user.businessCategory || user.businessIdea || "your business"}.`);
    const detail = hindi ? `यह क्यों मदद करता है: नियमित संपर्क से ग्राहक सेवा बेहतर होती है।\n\nपहले कदम:\n1. ${index === 0 ? customerDetail : index === 2 ? marketingDetail : "ग्राहक मांग और आसपास की कीमतों की तुलना करें।"}\n2. ग्राहक की सहमति के बिना निजी जानकारी साझा न करें।` : `Why it helps: consistent customer contact makes follow-up easier.\n\nFirst actions:\n1. ${index === 0 ? customerDetail : index === 2 ? marketingDetail : "Compare customer demand and nearby prices."}\n2. Do not share private customer information without permission.`;
    return { cardTitle, title: names[index], description, impact: index === 0 ? (declining ? g("highPriority") : g("highImpact")) : index === 1 ? g("mediumEffort") : beginner ? g("easyStart") : g("growth"), category: index === 0 ? (hindi ? "ग्राहक" : "Customers") : index === 1 ? (hindi ? "मूल्य" : "Pricing") : (hindi ? "मार्केटिंग" : "Marketing"), effort: index === 2 ? g("buildMonthly") : g("startWeek"), detail };
  });
}

  
export function getGrowthTip(user, metrics = []) {
  const language = languageOf(user);
  const hindi = language === "hi";
  const type = getBusinessType(user);
  const safeMetrics = Array.isArray(metrics) ? metrics : [];
  const latest = safeMetrics.length > 0 ? safeMetrics[safeMetrics.length - 1] : null;
  const previous = safeMetrics.length > 1 ? safeMetrics[safeMetrics.length - 2] : null;
  const latestSales = Number(latest?.sales) || 0;
  const previousSales = Number(previous?.sales) || 0;
  const latestExpenses = Number(latest?.expenses) || 0;
  const previousExpenses = Number(previous?.expenses) || 0;
  const latestProfit = Number.isFinite(Number(latest?.profit)) ? Number(latest.profit) : latestSales - latestExpenses;
  const previousProfit = Number.isFinite(Number(previous?.profit)) ? Number(previous.profit) : previousSales - previousExpenses;
  const declining = Boolean(latest && previous && latestSales < previousSales);
  const growing = Boolean(latest && previous && latestSales > previousSales);
  const expensesGrowing = Boolean(latest && previous && latestExpenses > previousExpenses);
  const marginImproving = latestSales > 0 && previousSales > 0 && latestProfit / latestSales > previousProfit / previousSales;
  const budgetAdvice = (Number(user.budget) || 0) < 100000 ? (hindi ? "कम लागत वाले कदमों से शुरू करें और खर्च दर्ज करें।" : "Start with low-cost actions and record each expense.") : (hindi ? "विस्तार से पहले छोटे परीक्षण करें और बजट का कुछ हिस्सा सुरक्षित रखें।" : "Test expansion in small steps and keep part of the budget reserved.");
  if (declining) return { title: hindi ? "बिक्री सुधार पर ध्यान दें" : "Focus on sales recovery", subtitle: hindi ? "हाल के बिक्री रिकॉर्ड के आधार पर" : "Based on your recent sales records", tip: hindi ? `${user.district || "अपने क्षेत्र"} में पुराने ग्राहकों से संपर्क करें और नए खर्च से पहले प्रतिक्रिया लें।` : `Contact previous customers in ${user.district || "your area"} and collect feedback before adding new spending.` };
  if (expensesGrowing) return { title: hindi ? "खर्च की समीक्षा करें" : "Review rising expenses", subtitle: hindi ? "हाल के खर्च रिकॉर्ड के आधार पर" : "Based on your recent expense records", tip: hindi ? "जरूरी और टाले जा सकने वाले खर्च अलग करें। अनावश्यक स्टॉक या उपकरण न जोड़ें।" : "Separate essential and avoidable costs. Avoid adding stock or equipment before you understand the extra expense." };
  if (marginImproving || growing) return { title: hindi ? "जो काम कर रहा है उसे दोहराएं" : "Repeat what is working", subtitle: hindi ? "हाल के व्यापार रिकॉर्ड के आधार पर" : "Based on your recent business records", tip: hindi ? `${user.businessCategory || user.businessIdea || "इस व्यवसाय"} में बेहतर परिणाम देने वाले उत्पाद या सेवा को छोटे कदमों में बढ़ाएं।` : `Scale the better-performing product or service for ${user.businessCategory || user.businessIdea || "this business"} in small, controlled steps.` };
  const fallback = { dairy: ["दूध के नियमित ग्राहकों पर ध्यान दें", "Focus on repeat dairy buyers"], retail: ["तेजी से बिकने वाले सामान पर ध्यान दें", "Track fast-moving products"], food: ["लोकप्रिय खाद्य उत्पादों को बेहतर बनाएं", "Improve your popular food items"], clothing: ["ग्राहक की पसंद से नया स्टॉक चुनें", "Choose new stock from customer requests"], general: ["एक आसान ग्राहक कदम से शुरू करें", "Start with one repeatable customer action"] }[type];
  return { title: hindi ? fallback[0] : fallback[1], subtitle: hindi ? "आपकी व्यवसाय प्रोफ़ाइल के आधार पर" : "Based on your business profile", tip: hindi ? `${user.village || user.district || "अपने क्षेत्र"} में एक ग्राहक संपर्क कदम चुनें और हर सप्ताह परिणाम दर्ज करें। ${budgetAdvice}` : `Choose one customer action in ${user.village || user.district || "your area"} and track the result each week. ${budgetAdvice}` };
}

export function getBusinessStrategy(user) {
  const language = languageOf(user);
  const hindi = language === "hi";
  const type = getBusinessType(user);
  const customer = type === "dairy" ? (hindi ? "आसपास के परिवार और छोटे खाद्य व्यवसाय" : "nearby households and small food businesses") : hindi ? "आपके स्थान के पास के ग्राहक" : "customers within easy reach of your location";
  const focus = type === "dairy" ? (hindi ? "ताजगी, डिलीवरी और खराब होने का खर्च" : "freshness, delivery, and spoilage costs") : hindi ? "सामान की बिक्री, सामग्री का खर्च और दोबारा मांग" : "stock turnover, material costs, and repeat demand";
  const allocations = translate(language, "recommendations.strategy.allocation");
  return { targetCustomer: customer, pricing: hindi ? `इस व्यवसाय के लिए आसपास की कीमतों की तुलना करें और ${focus} दर्ज करें।` : `For this ${type} business, compare nearby prices while tracking ${focus}.`, positioning: hindi ? `${user.businessIdea || "अपने व्यवसाय"} को भरोसेमंद गुणवत्ता और सुविधाजनक सेवा के लिए पहचान दें।` : `Position ${user.businessIdea || "the business"} around reliability, consistent quality, and convenient service.`, monthlyPlan: hindi ? "हर महीने एक ग्राहक लक्ष्य, एक बिक्री गतिविधि और एक खर्च समीक्षा तय करें।" : "Set one customer goal, one sales activity, and one expense review each month.", expenseControl: hindi ? `₹${(Number(user.budget) || 0).toLocaleString("en-IN")} के बजट को बचाने के लिए उपकरण या बड़ा स्टॉक खरीदने से पहले मांग जांचें।` : `Protect the available budget of ₹${(Number(user.budget) || 0).toLocaleString("en-IN")} by testing demand before buying equipment or large inventory.`, revenueAction: hindi ? "नियमित ग्राहकों के लिए दोबारा खरीद का सरल विकल्प दें।" : "Offer a simple repeat-purchase option for your regular customers.", budgetAllocation: allocations.map((name, index) => ({ name, percentage: [40, 20, 10, 20, 10][index], amount: Math.round((Number(user.budget) || 0) * [0.4, 0.2, 0.1, 0.2, 0.1][index]) })), firstThirtyDays: hindi ? ["संभावित ग्राहकों से बात करके पहली पेशकश पक्की करें।", "हर सेटअप और संचालन खर्च दर्ज करें।", "महीने के अंत में ग्राहक प्रतिक्रिया की समीक्षा करें।"] : ["Speak with potential customers and confirm the first offer.", "Record every setup and operating expense.", "Review customer feedback at the end of the month."] };
}

export function getLocationStrategy(user) {
  const language = languageOf(user);
  const hindi = language === "hi";
  const place = [user.village, user.district, user.state].filter(Boolean).join(", ") || (hindi ? "चुना हुआ क्षेत्र" : "your chosen area");
  const type = getBusinessType(user);
  const consideration = type === "dairy" ? (hindi ? "पानी, साफ भंडारण, चारा और ग्राहकों तक व्यावहारिक मार्ग को प्राथमिकता दें।" : "Prioritize water access, clean storage, supply access, and a practical route to customers.") : type === "retail" ? (hindi ? "आसपास के परिवार, दिखाई देने वाली आवाजाही, सामान उतारने की सुविधा और सप्लायर पहुंच को प्राथमिकता दें।" : "Prioritize nearby households, visible foot traffic, easy loading, and regular supplier access.") : (hindi ? "ग्राहकों तक पहुंच, उचित भंडारण और सेवा के अनुकूल स्थान को प्राथमिकता दें।" : "Prioritize customer access, suitable storage, and a location that supports your service.");
  return { area: hindi ? `${place} में ऐसा क्षेत्र चुनें जहां आपके लक्षित ग्राहक नियमित रूप से आते-जाते हों।` : `Prioritize an area in or near ${place} where your target customers already travel regularly.`, customers: consideration, suppliers: hindi ? "स्थान तय करने से पहले सप्लायर की दूरी, डिलीवरी, भंडारण और परिवहन खर्च जांचें।" : "Check supplier distance, delivery frequency, storage needs, and transport costs before committing.", competition: hindi ? "अलग-अलग समय पर आसपास के प्रतिस्पर्धियों को देखें और ग्राहकों की अधूरी जरूरत खोजें।" : "Visit nearby competitors at different times and look for an unmet customer need.", cost: hindi ? "किराया, बिजली, परिवहन और सेटअप खर्च को साथ में तुलना करें और दैनिक संचालन के लिए बजट बचाएं।" : "Compare rent, utilities, transport, and setup costs together; keep enough budget for daily operations.", storage: hindi ? "स्थान चुनने से पहले सूखे, ठंडे, सुरक्षित या ग्राहक की पहुंच वाले भंडारण की जरूरत जांचें।" : "Check whether the business needs dry, cold, secure, or customer-accessible storage.", visibility: hindi ? "जब ग्राहक सीधे आते हों तो आसानी से दिखाई देने वाली जगह चुनें, लेकिन कुल खर्च की तुलना पहले करें।" : "Prefer a visible, easy-to-reach spot when walk-in customers matter, but compare total cost first." };
}
