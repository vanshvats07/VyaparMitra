const FINANCIAL_RECORDS_KEY = "vyaparMitraFinancialRecords";

export function getFinancialRecords() {
  if (typeof window === "undefined") return [];

  try {
    const storedRecords = window.localStorage.getItem(FINANCIAL_RECORDS_KEY);
    const records = storedRecords ? JSON.parse(storedRecords) : [];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function writeFinancialRecords(records) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FINANCIAL_RECORDS_KEY, JSON.stringify(records));
}

export function saveFinancialRecord(record) {
  const records = getFinancialRecords();
  const savedRecord = {
    ...record,
    id: record.id || crypto.randomUUID(),
    sales: Number(record.sales),
    expenses: Number(record.expenses),
    profit: Number(record.sales) - Number(record.expenses),
    createdAt: record.createdAt || new Date().toISOString(),
  };

  writeFinancialRecords([...records, savedRecord]);
  return savedRecord;
}

export function updateFinancialRecord(id, record) {
  const records = getFinancialRecords();
  const updatedRecord = {
    ...record,
    id,
    sales: Number(record.sales),
    expenses: Number(record.expenses),
    profit: Number(record.sales) - Number(record.expenses),
  };

  writeFinancialRecords(
    records.map((existingRecord) =>
      existingRecord.id === id ? { ...existingRecord, ...updatedRecord } : existingRecord
    )
  );
  return updatedRecord;
}

export function deleteFinancialRecord(id) {
  const records = getFinancialRecords();
  writeFinancialRecords(records.filter((record) => record.id !== id));
}