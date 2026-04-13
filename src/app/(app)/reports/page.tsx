"use client";

import { useState, useEffect, useCallback } from "react";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { getCurrentQuarter } from "@/lib/utils";

interface StudentReport {
  _id: string;
  name: string;
  grade: string;
  currentBalance: number;
  earned: number;
  redeemed: number;
}

interface GradeSummary {
  [grade: string]: { earned: number; redeemed: number; students: number };
}

interface ReportData {
  students: StudentReport[];
  gradeSummary: GradeSummary;
  totals: { earned: number; redeemed: number; activeStudents: number };
}

function getQuarterOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
    const q = Math.ceil((d.getMonth() + 1) / 3);
    options.push({
      value: `Q${q}-${d.getFullYear()}`,
      label: `Q${q} ${d.getFullYear()}`,
    });
  }
  return options;
}

export default function ReportsPage() {
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [grade, setGrade] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"name" | "earned" | "redeemed" | "currentBalance">("earned");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ quarter });
    if (grade) params.set("grade", grade);
    const res = await fetch(`/api/reports?${params}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [quarter, grade]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sortedStudents = data?.students.slice().sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortField === "name") return mul * a.name.localeCompare(b.name);
    return mul * ((a[sortField] || 0) - (b[sortField] || 0));
  });

  function exportCSV() {
    if (!sortedStudents) return;
    const headers = "Name,Grade,Earned,Redeemed,Balance\n";
    const rows = sortedStudents
      .map((s) => `"${s.name}",${s.grade},${s.earned},${s.redeemed},${s.currentBalance}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `good-friend-report-${quarter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const gradeOptions = [
    { value: "", label: "All Grades" },
    { value: "K", label: "Kindergarten" },
    { value: "1", label: "Grade 1" },
    { value: "2", label: "Grade 2" },
    { value: "3", label: "Grade 3" },
    { value: "4", label: "Grade 4" },
    { value: "5", label: "Grade 5" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bca-dark">Reports</h1>
        <Button variant="ghost" onClick={exportCSV} disabled={!data}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          options={getQuarterOptions()}
          className="w-40"
        />
        <Select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          options={gradeOptions}
          className="w-40"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-heading font-bold text-green-600">{data.totals.earned}</div>
                <div className="text-sm text-gray-500">Total Earned</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-heading font-bold text-bca-red">{data.totals.redeemed}</div>
                <div className="text-sm text-gray-500">Total Redeemed</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-heading font-bold text-bca-teal">{data.totals.activeStudents}</div>
                <div className="text-sm text-gray-500">Active Students</div>
              </CardBody>
            </Card>
          </div>

          {/* Grade Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="font-heading font-semibold text-bca-dark">By Grade</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(data.gradeSummary)
                  .sort(([a], [b]) => (a === "K" ? -1 : b === "K" ? 1 : a.localeCompare(b)))
                  .map(([g, summary]) => {
                    const maxVal = Math.max(...Object.values(data.gradeSummary).map((s) => s.earned));
                    const pct = maxVal > 0 ? (summary.earned / maxVal) * 100 : 0;
                    return (
                      <div key={g} className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-600">
                          {g === "K" ? "Kinder" : `Grade ${g}`}
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-bca-teal rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm">
                          <span className="text-green-600 font-medium">{summary.earned}</span>
                          {" / "}
                          <span className="text-bca-red">{summary.redeemed}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardBody>
          </Card>

          {/* Student Table */}
          <Card>
            <CardHeader>
              <h2 className="font-heading font-semibold text-bca-dark">Student Detail</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      { key: "name" as const, label: "Student" },
                      { key: "earned" as const, label: "Earned" },
                      { key: "redeemed" as const, label: "Redeemed" },
                      { key: "currentBalance" as const, label: "Balance" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-5 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-bca-dark transition"
                      >
                        {col.label}
                        {sortField === col.key && (
                          <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedStudents?.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-bca-dark">{s.name}</div>
                        <Badge variant="gray">{s.grade === "K" ? "K" : `Gr ${s.grade}`}</Badge>
                      </td>
                      <td className="px-5 py-3 text-green-600 font-medium">{s.earned}</td>
                      <td className="px-5 py-3 text-bca-red font-medium">{s.redeemed}</td>
                      <td className="px-5 py-3 text-bca-teal font-bold">{s.currentBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
