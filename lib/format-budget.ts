const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatBudget(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError("Budget must be a non-negative finite number.");
  }

  return rupeeFormatter.format(amount);
}
