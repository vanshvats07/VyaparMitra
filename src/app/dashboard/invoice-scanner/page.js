"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveFinancialRecord } from "@/lib/financialStorage";

const ACCEPTED_TYPES = "image/jpeg,image/png,application/pdf";

function formatCurrency(value) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function getDateParts(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return { month: "Unknown", year: new Date().getFullYear() };
  return { month: date.toLocaleDateString("en-IN", { month: "long" }), year: date.getFullYear() };
}

export default function InvoiceScanner() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.user?._id) {
          router.replace("/login");
          return;
        }
        setUserId(data.user._id);
      })
      .catch(() => setError("Unable to load your profile right now."));
  }, [router]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function selectFile(event) {
    const selectedFile = event.target.files?.[0];
    setError("");
    setInvoice(null);
    if (!selectedFile) return;
    if (!ACCEPTED_TYPES.split(",").includes(selectedFile.type)) {
      setFile(null);
      setError("Please upload a JPG, PNG, or supported PDF invoice.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("This file is too large. Please upload a file under 10 MB.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(selectedFile.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : "");
  }

  function resetScan() {
    setFile(null);
    setInvoice(null);
    setError("");
    setStatus("");
    setPreviewUrl("");
  }

  async function scanInvoice() {
    if (!file) return;
    setError("");
    setStatus("Reading invoice...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setStatus("Extracting details...");
      const response = await fetch("/api/invoice/scan", { method: "POST", body: formData });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Invoice scanner returned an unexpected response (HTTP ${response.status}).`);
      }
      if (!response.ok || !data.success) throw new Error(data.message || "Couldn't read this invoice.");
      setStatus("Preparing invoice summary...");
      setInvoice(data.invoice);
    } catch (scanError) {
      setError(scanError.message || "The invoice scanner is temporarily unavailable. Please try again.");
    } finally {
      setStatus("");
    }
  }

  function updateInvoice(field, value) {
    setInvoice({ ...invoice, [field]: value });
  }

  function updateItem(index, field, value) {
    const items = invoice.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "name" ? value : Number(value) || 0 } : item);
    setInvoice({ ...invoice, items });
  }

  function handleInvoiceTypeChange(event) {
    updateInvoice("invoiceType", event.target.value);
  }

  function addItem() {
    setInvoice({ ...invoice, items: [...invoice.items, { name: "", quantity: 0, unitPrice: 0, total: 0 }] });
  }

  function removeItem(index) {
    setInvoice({ ...invoice, items: invoice.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  async function confirmSave() {
    if (!invoice || !userId || !["sale", "purchase"].includes(invoice.invoiceType)) {
      setError("Please select whether this is a sale or purchase before saving.");
      return;
    }
    if (invoice.totalAmount === null || !Number.isFinite(Number(invoice.totalAmount)) || Number(invoice.totalAmount) < 0) {
      setError("Please provide a valid invoice total before saving.");
      return;
    }
    setSaving(true);
    setError("");
    const dateParts = getDateParts(invoice.invoiceDate);
    const record = {
      month: `${dateParts.month} ${dateParts.year}`,
      year: dateParts.year,
      sales: invoice.invoiceType === "sale" ? Number(invoice.totalAmount) : 0,
      expenses: invoice.invoiceType === "purchase" ? Number(invoice.totalAmount) : 0,
    };
    record.profit = record.sales - record.expenses;
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...record }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to save invoice.");
      saveFinancialRecord({ ...record, invoiceType: invoice.invoiceType, invoiceNumber: invoice.invoiceNumber, vendorName: invoice.vendorName, customerName: invoice.customerName, category: invoice.category, invoiceDate: invoice.invoiceDate });
      setStatus("Invoice saved successfully");
      router.replace("/dashboard");
    } catch (saveError) {
      setError(saveError.message || "Unable to save invoice right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">Invoice Scanner</p></div>
          <button onClick={() => router.push("/dashboard")} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Dashboard</button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8"><p className="text-sm font-semibold text-green-700">Financial tools</p><h1 className="mt-2 text-3xl font-bold">Invoice Scanner</h1><p className="mt-2 text-slate-600">Upload an invoice and let VyaparMitra extract the important details automatically.</p></div>
        {!invoice && <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 px-6 text-center hover:bg-green-50">
            <span className="text-4xl">📄</span><span className="mt-3 text-lg font-bold">Upload Invoice</span><span className="mt-1 text-sm text-slate-500">JPG, PNG or PDF</span>
            <input type="file" accept={ACCEPTED_TYPES} onChange={selectFile} className="sr-only" />
          </label>
          {file && <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
            {previewUrl ? <img src={previewUrl} alt="Invoice preview" className="h-20 w-20 rounded-lg object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-50 text-2xl">📑</div>}
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button onClick={resetScan} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Remove</button>
          </div>}
          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {status && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{status}</p>}
          <button onClick={scanInvoice} disabled={!file || Boolean(status)} className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{status || "Scan Invoice"}</button>
          {!file && <div className="mt-6 text-center"><p className="font-semibold text-slate-700">Turn paper invoices into digital records</p><p className="mt-1 text-sm text-slate-500">Upload an invoice and VyaparMitra will extract the details for you.</p></div>}
        </section>}
        {invoice && <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-green-700">Review Invoice</p><h2 className="mt-1 text-2xl font-bold">Invoice Details</h2></div><button onClick={resetScan} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Scan Again</button></div>
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Invoice Type:</p>
            <p className="mt-1 text-xl font-bold uppercase text-green-700">{invoice.invoiceType === "sale" ? "SALE" : invoice.invoiceType === "purchase" ? "PURCHASE" : "SELECT TYPE"}</p>
            <label className="mt-3 block text-sm font-semibold text-slate-700">Change detected type<select value={invoice.invoiceType || "unknown"} onChange={handleInvoiceTypeChange} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option value="unknown">Select type</option><option value="sale">SALE</option><option value="purchase">PURCHASE</option></select></label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[['vendorName','Vendor'],['customerName','Customer'],['invoiceNumber','Invoice Number'],['invoiceDate','Date'],['category','Category']].map(([field, label]) => <label key={field} className="text-sm font-semibold text-slate-700">{label}<input value={invoice[field] || ""} onChange={(event) => updateInvoice(field, event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></label>)}
          </div>
          <div className="mt-8 overflow-x-auto"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Items</h3><button onClick={addItem} className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">+ Add item</button></div><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="p-2">Item</th><th className="p-2">Quantity</th><th className="p-2">Unit Price</th><th className="p-2">Total</th><th className="p-2"></th></tr></thead><tbody>{invoice.items.map((item, index) => <tr key={index} className="border-b"><td className="p-2"><input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="w-full rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.quantity ?? 0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="w-24 rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.unitPrice ?? 0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="w-28 rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.total ?? 0} onChange={(event) => updateItem(index, "total", event.target.value)} className="w-28 rounded-lg border px-2 py-2" /></td><td className="p-2"><button onClick={() => removeItem(index)} className="text-red-600 hover:underline">Remove</button></td></tr>)}</tbody></table></div>
          <div className="mt-8 ml-auto max-w-sm space-y-3 border-t pt-5"><label className="flex items-center justify-between gap-4 text-sm">Subtotal<input type="number" min="0" value={invoice.subtotal ?? 0} onChange={(event) => updateInvoice("subtotal", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label><label className="flex items-center justify-between gap-4 text-sm">Tax<input type="number" min="0" value={invoice.tax ?? 0} onChange={(event) => updateInvoice("tax", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label><label className="flex items-center justify-between gap-4 font-bold">Total Amount<input type="number" min="0" value={invoice.totalAmount ?? 0} onChange={(event) => updateInvoice("totalAmount", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label></div>
          {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{status && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{status}</p>}
          <div className="mt-8 flex flex-wrap justify-end gap-3"><button onClick={resetScan} className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Scan Again</button><button onClick={confirmSave} disabled={saving} className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">{saving ? "Saving..." : "Confirm & Save"}</button></div>
        </section>}
      </div>
    </main>
  );
}
