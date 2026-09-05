import { getWhatIfImpacts } from "./whatIf";

/**
 * Calculates projected balance based on active What-If scenarios.
 */
export function calculateProjectedBalance(
  baseBalance = 0,
  scenarios = {},
  latestSales = 0
) {
  const impacts = getWhatIfImpacts(latestSales);
  let balance = baseBalance;

  if (scenarios.salesDrop) {
    balance -= impacts.salesDrop;
  }

  if (scenarios.bulkBuyers) {
    balance += impacts.bulkBuyers;
  }

  return balance;
}
