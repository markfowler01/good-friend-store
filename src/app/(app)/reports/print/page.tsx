"use client";

import { useEffect, useState } from "react";

interface Student {
  _id: string;
  name: string;
  barcodeId?: string | null;
  ticketBalance: number;
}

export default function PrintReportPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [onlyWithBalance, setOnlyWithBalance] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data: Student[]) => {
        setStudents(
          data
            .filter((s) => !onlyWithBalance || s.ticketBalance > 0)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      });
  }, [onlyWithBalance]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalTickets = students?.reduce((sum, s) => sum + s.ticketBalance, 0) ?? 0;

  return (
    <div className="print-sheet">
      {/* Print controls — hidden when printing */}
      <div className="no-print mb-6 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-bca-accent hover:bg-bca-accent-hover text-white font-medium py-2.5 px-5 rounded-lg shadow-[0_4px_20px_rgba(205,68,25,0.25)] hover:shadow-[0_6px_28px_rgba(205,68,25,0.4)] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={onlyWithBalance}
            onChange={(e) => setOnlyWithBalance(e.target.checked)}
            className="accent-bca-accent"
          />
          Only show kids with tickets
        </label>
        <a href="/reports" className="text-sm text-bca-teal hover:underline ml-auto">
          ← Back to Reports
        </a>
      </div>

      {/* Printable content */}
      <div className="bg-white">
        <header className="mb-6 pb-4 border-b-2 border-bca-accent">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-bca-accent font-bold">
                Bethany Christian Assembly
              </div>
              <h1 className="text-3xl font-heading font-bold text-bca-dark mt-1">
                Good Friend Store
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-widest">
                Ticket Balance Sheet
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>{today}</div>
              <div className="font-mono mt-1">
                {students?.length ?? 0} kids · {totalTickets} tickets
              </div>
            </div>
          </div>
        </header>

        {!students ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No kids to display</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 pr-3 font-bold text-bca-dark uppercase text-xs tracking-wide">
                  Name
                </th>
                <th className="text-left py-2 pr-3 font-bold text-bca-dark uppercase text-xs tracking-wide w-28">
                  Barcode
                </th>
                <th className="text-right py-2 pl-3 font-bold text-bca-dark uppercase text-xs tracking-wide w-24">
                  Tickets
                </th>
                <th className="w-24 text-center py-2 font-bold text-bca-dark uppercase text-xs tracking-wide">
                  ✓
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s._id}
                  className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                >
                  <td className="py-2 pr-3 font-medium text-bca-dark">{s.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-gray-500">
                    {s.barcodeId ?? "—"}
                  </td>
                  <td className="py-2 pl-3 text-right font-bold text-bca-accent text-lg">
                    {s.ticketBalance}
                  </td>
                  <td className="py-2 text-center">
                    <span className="inline-block w-5 h-5 border border-gray-400 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <footer className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center font-mono uppercase tracking-widest">
          Live. Love. Lead. Like Jesus.
        </footer>
      </div>
    </div>
  );
}
