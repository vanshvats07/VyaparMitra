"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveFinancialRecord } from "@/lib/financialStorage";
import { useLanguage } from "@/lib/useLanguage";

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
  const [profileLanguage, setProfileLanguage] = useState("en");
  const { t } = useLanguage(profileLanguage);
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
        setProfileLanguage(data.user.language || "en");
      })
      .catch(() => setError(t("dashboard.invoice.profileError")));
  }, [router]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function selectFile(event) {
    const selectedFile = event.target.files?.[0];
    setError("");
    setInvoice(null);
    if (!selectedFile) return;
    if (!ACCEPTED_TYPES.split(",").includes(selectedFile.type)) {
      setFile(null);
      setError(t("dashboard.invoice.invalidFile"));
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError(t("dashboard.invoice.fileTooLarge"));
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
    setStatus(t("dashboard.invoice.reading"));
    const formData = new FormData();
    formData.append("file", file);
    try {
      setStatus(t("dashboard.invoice.extracting"));
      const response = await fetch("/api/invoice/scan", { method: "POST", body: formData });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(t("dashboard.invoice.unexpected", { status: response.status }));
      }
      if (!response.ok || !data.success) throw new Error(data.message || t("dashboard.invoice.couldn'tRead"));
      setStatus(t("dashboard.invoice.preparing"));
      setInvoice(data.invoice);
    } catch (scanError) {
      setError(scanError.message || t("dashboard.invoice.unavailable"));
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
      setError(t("dashboard.invoice.uploadType"));
      return;
    }
    if (invoice.totalAmount === null || !Number.isFinite(Number(invoice.totalAmount)) || Number(invoice.totalAmount) < 0) {
      setError(t("dashboard.invoice.validTotal"));
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
      if (!response.ok || !data.success) throw new Error(data.message || t("dashboard.invoice.unableSave"));
      saveFinancialRecord({ ...record, invoiceType: invoice.invoiceType, invoiceNumber: invoice.invoiceNumber, vendorName: invoice.vendorName, customerName: invoice.customerName, category: invoice.category, invoiceDate: invoice.invoiceDate });
      setStatus(t("dashboard.invoice.saved"));
      router.replace("/dashboard");
    } catch (saveError) {
      setError(saveError.message || t("dashboard.invoice.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">{t("dashboard.invoice.title")}</p></div>
          <button onClick={() => router.push("/dashboard")} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← {t("dashboard.invoice.dashboard")}</button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8"><p className="text-sm font-semibold text-green-700">{t("dashboard.invoice.tools")}</p><h1 className="mt-2 text-3xl font-bold">{t("dashboard.invoice.title")}</h1><p className="mt-2 text-slate-600">{t("dashboard.invoice.subtitle")}</p></div>
        {!invoice && <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 px-6 text-center hover:bg-green-50">
            <span className="text-4xl">📄</span><span className="mt-3 text-lg font-bold">{t("dashboard.invoice.upload")}</span><span className="mt-1 text-sm text-slate-500">{t("dashboard.invoice.formats")}</span>
            <input type="file" accept={ACCEPTED_TYPES} onChange={selectFile} className="sr-only" />
          </label>
          {file && <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
            {previewUrl ? <img src={previewUrl} alt="Invoice preview" className="h-20 w-20 rounded-lg object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-50 text-2xl">📑</div>}
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button onClick={resetScan} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">{t("dashboard.invoice.remove")}</button>
          </div>}
          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {status && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{status}</p>}
          <button onClick={scanInvoice} disabled={!file || Boolean(status)} className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{status || t("dashboard.invoice.scan")}</button>
          {!file && <div className="mt-6 text-center"><p className="font-semibold text-slate-700">{t("dashboard.invoice.intro")}</p><p className="mt-1 text-sm text-slate-500">{t("dashboard.invoice.introText")}</p></div>}
        </section>}
        {invoice && <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-green-700">{t("dashboard.invoice.review")}</p><h2 className="mt-1 text-2xl font-bold">{t("dashboard.invoice.details")}</h2></div><button onClick={resetScan} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">{t("dashboard.invoice.scanAgain")}</button></div>
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-semibold text-slate-700">{t("dashboard.invoice.type")}</p>
            <p className="mt-1 text-xl font-bold uppercase text-green-700">{invoice.invoiceType === "sale" ? t("dashboard.invoice.sale") : invoice.invoiceType === "purchase" ? t("dashboard.invoice.purchase") : t("dashboard.invoice.selectType")}</p>
            <label className="mt-3 block text-sm font-semibold text-slate-700">{t("dashboard.invoice.changeType")}<select value={invoice.invoiceType || "unknown"} onChange={handleInvoiceTypeChange} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option value="unknown">{t("dashboard.invoice.selectType")}</option><option value="sale">{t("dashboard.invoice.sale")}</option><option value="purchase">{t("dashboard.invoice.purchase")}</option></select></label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[['vendorName',t("dashboard.invoice.vendor")],['customerName',t("dashboard.invoice.customer")],['invoiceNumber',t("dashboard.invoice.number")],['invoiceDate',t("dashboard.invoice.date")],['category',t("dashboard.invoice.category")]].map(([field, label]) => <label key={field} className="text-sm font-semibold text-slate-700">{label}<input value={invoice[field] || ""} onChange={(event) => updateInvoice(field, event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></label>)}
          </div>
          <div className="mt-8 overflow-x-auto"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{t("dashboard.invoice.items")}</h3><button onClick={addItem} className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">{t("dashboard.invoice.addItem")}</button></div><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="p-2">{t("dashboard.invoice.item")}</th><th className="p-2">{t("dashboard.invoice.quantity")}</th><th className="p-2">{t("dashboard.invoice.unitPrice")}</th><th className="p-2">{t("common.total")}</th><th className="p-2"></th></tr></thead><tbody>{invoice.items.map((item, index) => <tr key={index} className="border-b"><td className="p-2"><input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="w-full rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.quantity ?? 0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="w-24 rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.unitPrice ?? 0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="w-28 rounded-lg border px-2 py-2" /></td><td className="p-2"><input type="number" min="0" value={item.total ?? 0} onChange={(event) => updateItem(index, "total", event.target.value)} className="w-28 rounded-lg border px-2 py-2" /></td><td className="p-2"><button onClick={() => removeItem(index)} className="text-red-600 hover:underline">{t("dashboard.invoice.remove")}</button></td></tr>)}</tbody></table></div>
          <div className="mt-8 ml-auto max-w-sm space-y-3 border-t pt-5"><label className="flex items-center justify-between gap-4 text-sm">{t("dashboard.invoice.subtotal")}<input type="number" min="0" value={invoice.subtotal ?? 0} onChange={(event) => updateInvoice("subtotal", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label><label className="flex items-center justify-between gap-4 text-sm">{t("dashboard.invoice.tax")}<input type="number" min="0" value={invoice.tax ?? 0} onChange={(event) => updateInvoice("tax", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label><label className="flex items-center justify-between gap-4 font-bold">{t("dashboard.invoice.totalAmount")}<input type="number" min="0" value={invoice.totalAmount ?? 0} onChange={(event) => updateInvoice("totalAmount", Number(event.target.value) || 0)} className="w-36 rounded-lg border px-2 py-2 text-right" /></label></div>
          {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{status && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{status}</p>}
          <div className="mt-8 flex flex-wrap justify-end gap-3"><button onClick={resetScan} className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">{t("dashboard.invoice.scanAgain")}</button><button onClick={confirmSave} disabled={saving} className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">{saving ? t("dashboard.invoice.saving") : t("dashboard.invoice.confirmSave")}</button></div>
        </section>}
      </div>
    </main>
  );
}
