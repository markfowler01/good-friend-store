"use client";

import { useState } from "react";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);

  async function handleExportData() {
    setExporting(true);
    const [studentsRes, txRes] = await Promise.all([
      fetch("/api/students"),
      fetch("/api/transactions?limit=10000"),
    ]);

    const students = studentsRes.ok ? await studentsRes.json() : [];
    const transactions = txRes.ok ? await txRes.json() : [];

    const data = { students, transactions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `good-friend-store-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Settings</h1>

      {/* Access Info */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-heading font-semibold text-bca-dark">Access Code</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-2">
            Share this code with teachers and helpers so they can log in.
            The access code is set via the <code className="bg-gray-100 px-1 rounded">ACCESS_CODE</code> environment variable in Vercel.
          </p>
          <p className="text-sm text-gray-500">
            Default code: <span className="font-mono font-bold text-bca-teal">goodfriend</span>
          </p>
        </CardBody>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-bca-dark">Data Management</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Export all student data and transaction history as a JSON backup file.
          </p>
          <Button variant="secondary" onClick={handleExportData} loading={exporting}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export All Data
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
