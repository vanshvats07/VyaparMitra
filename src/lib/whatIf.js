export function calculateWhatIf({ salesDrop, bulkBuyers } = {}) {
  let balance = 80000;

  if (salesDrop) {
    balance -= 16000;
  }

  if (bulkBuyers) {
    balance += 25000;
  }

  return balance;
}
