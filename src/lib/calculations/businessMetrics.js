const profileFields = [
  "name",
  "phone",
  "state",
  "district",
  "businessIdea",
  "businessCategory",
  "budget",
  "experience",
];

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function calculateBusinessMetrics(user) {
  const completedFields = profileFields.filter((field) => {
    if (field === "budget") {
      return Number.isFinite(Number(user?.budget)) && Number(user.budget) >= 0;
    }

    return hasValue(user?.[field]);
  }).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const readinessScore = [
    { complete: hasValue(user?.businessIdea), weight: 25 },
    { complete: hasValue(user?.businessCategory), weight: 20 },
    { complete: hasValue(user?.state) && hasValue(user?.district), weight: 20 },
    {
      complete: Number.isFinite(Number(user?.budget)) && Number(user.budget) > 0,
      weight: 20,
    },
    { complete: hasValue(user?.experience), weight: 15 },
  ].reduce((score, item) => score + (item.complete ? item.weight : 0), 0);

  let readinessLabel = "Needs more information";
  if (readinessScore >= 80) {
    readinessLabel = "Good foundation";
  } else if (readinessScore >= 50) {
    readinessLabel = "Partially ready";
  }

  return {
    profileCompletion,
    readinessScore,
    readinessLabel,
  };
}