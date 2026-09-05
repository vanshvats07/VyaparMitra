export function getWhatIfImpacts(latestSales = 0) {
  return {
    salesDrop: Math.round(latestSales * 0.2),
    bulkBuyers: Math.round(latestSales * 0.3),
  };
}

export function calculateWhatIf({
  baseBalance = 0,
  latestSales = 0,
  salesDrop,
  bulkBuyers,
} = {}) {
  const impacts = getWhatIfImpacts(latestSales);
  let balance = baseBalance;

  if (salesDrop) {
    balance -= impacts.salesDrop;
  }

  if (bulkBuyers) {
    balance += impacts.bulkBuyers;
  }

  return balance;
}
