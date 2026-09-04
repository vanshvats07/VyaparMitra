export const BASE_BALANCE = 80000;

export const SCENARIO_IMPACTS = {
  salesDrop: -16000,
  bulkBuyers: 25000,
};

/**
 * Calculates projected balance based on active What-If scenarios.
 */
export function calculateProjectedBalance(baseBalance = BASE_BALANCE, scenarios = {}) {
  let balance = baseBalance;

  if (scenarios.salesDrop) {
    balance += SCENARIO_IMPACTS.salesDrop;
  }

  if (scenarios.bulkBuyers) {
    balance += SCENARIO_IMPACTS.bulkBuyers;
  }

  return balance;
}
