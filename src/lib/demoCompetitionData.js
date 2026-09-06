const CATEGORY_EXAMPLES = {
  dairy: ["Local Dairy & Milk Point", "Fresh Milk Center", "Village Dairy Products"],
  grocery: ["Local General Store", "Village Kirana Store", "Daily Needs Store"],
  "food processing": ["Local Food Products", "Village Processing Unit", "Fresh Foods Center"],
  retail: ["Neighbourhood Retail Shop", "Village Daily Needs", "Local Market Store"],
  agriculture: ["Local Farm Supply Point", "Village Agri Services", "Nearby Farm Store"],
};

function getCategoryKey(profile) {
  const value = `${profile.businessCategory} ${profile.businessIdea}`.toLowerCase();
  return Object.keys(CATEGORY_EXAMPLES).find((key) => value.includes(key)) || "retail";
}

export function createDemoCompetitionData(profile) {
  const categoryKey = getCategoryKey(profile);
  const categoryLabel = profile.businessCategory || categoryKey;
  const locationLabel = [profile.village, profile.district, profile.state].filter(Boolean).join(", ");

  return CATEGORY_EXAMPLES[categoryKey].map((name, index) => ({
    name,
    category: categoryLabel,
    rating: ["Example rating", "Example rating", "Example rating"][index],
    reviewCount: "Example reviews",
    distance: "Example distance",
    priceRange: "Example price range",
    location: locationLabel ? `Example only — not verified in ${locationLabel}` : "Example only — location not verified",
    source: "Demo example",
  }));
}
