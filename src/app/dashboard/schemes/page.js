"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const schemes = [
  {
    name: "Pradhan Mantri Mudra Yojana",
    type: "Central Government",
    category: "Business Loan",
    description:
      "छोटे व्यवसायों और नए entrepreneurs को business शुरू या expand करने के लिए loan की सुविधा।",
    benefit: "₹10 लाख तक का loan",
    eligibility: "Small business owners और entrepreneurs",
    documents: "Aadhaar, PAN, Bank Account",
    status: "Active",
  },
  {
    name: "PMFME Scheme",
    type: "Central Government",
    category: "Food Processing",
    description:
      "Food processing business शुरू करने या existing unit को upgrade करने के लिए financial support।",
    benefit: "35% तक credit linked subsidy",
    eligibility: "Food processing businesses",
    documents: "Aadhaar, PAN, Business Documents",
    status: "Active",
  },
  {
    name: "Dairy Development Scheme",
    type: "Uttar Pradesh",
    category: "Dairy",
    description:
      "दूध उत्पादन और dairy infrastructure को बढ़ावा देने के लिए financial assistance।",
    benefit: "Business और equipment support",
    eligibility: "Eligible dairy farmers और entrepreneurs",
    documents: "Aadhaar, Bank Account, Land/Business Documents",
    status: "Active",
  },
  {
    name: "PMEGP",
    type: "Central Government",
    category: "New Business",
    description:
      "नए micro enterprises शुरू करने के लिए credit linked subsidy और financial assistance।",
    benefit: "Subsidy based business support",
    eligibility: "New entrepreneurs",
    documents: "Aadhaar, PAN, Project Report",
    status: "Active",
  },
  {
    name: "Kisan Credit Card",
    type: "Central Government",
    category: "Agriculture",
    description:
      "Agriculture और allied activities के लिए किसानों को आसान credit facility।",
    benefit: "Flexible agricultural credit",
    eligibility: "Eligible farmers",
    documents: "Aadhaar, Land Documents, Bank Details",
    status: "Active",
  },
  {
    name: "Stand Up India",
    type: "Central Government",
    category: "Business Loan",
    description:
      "Eligible entrepreneurs को नया business शुरू करने के लिए bank loan support।",
    benefit: "₹10 लाख से ₹1 करोड़ तक",
    eligibility: "Eligible entrepreneurs",
    documents: "Identity, Address और Business Documents",
    status: "Active",
  },
];

export default function Schemes() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Business Loan",
    "Dairy",
    "Agriculture",
    "Food Processing",
    "New Business",
  ];

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || scheme.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>

            <p className="text-xs text-slate-500">
              व्यवसाय मार्गदर्शन एवं सहायता
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        <section>
          <p className="text-sm font-semibold text-green-700">
            सरकारी सहायता
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Government Schemes
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            अपने business और location के अनुसार relevant सरकारी
            योजनाएं और financial support खोजें।
          </p>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 md:flex-1"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </section>

        <section className="mt-8">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Schemes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredSchemes.length} schemes found
              </p>
            </div>
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <p className="text-lg font-semibold">
                No schemes found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Search या category बदलकर फिर try करें।
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">

              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.name}
                  className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {scheme.status}
                      </span>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {scheme.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {scheme.type}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                      🏦
                    </div>

                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {scheme.description}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Main Benefit
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {scheme.benefit}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {scheme.category}
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 border-t pt-5">

                    <p className="text-sm font-semibold text-slate-900">
                      Eligibility
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {scheme.eligibility}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      Required Documents
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {scheme.documents}
                    </p>

                  </div>

                  <div className="mt-6 flex gap-3">

                    <button
                      onClick={() =>
                        alert("Detailed scheme information will be added soon.")
                      }
                      className="flex-1 rounded-lg border border-green-700 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() =>
                        alert("Official application link will be added soon.")
                      }
                      className="flex-1 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      Apply Now
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        <section className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-6">

          <h2 className="text-lg font-bold text-green-900">
            💡 Important
          </h2>

          <p className="mt-2 text-sm leading-6 text-green-800">
            किसी भी government scheme के लिए apply करने से पहले
            eligibility, required documents और official government
            portal पर उपलब्ध latest information जरूर verify करें।
          </p>

        </section>

      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — छोटे व्यवसायों के लिए डिजिटल मार्गदर्शन
        </div>
      </footer>

    </main>
  );
}