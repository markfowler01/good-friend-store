"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card, { CardBody } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { timeAgo } from "@/lib/utils";

interface Stats {
  totalStudents: number;
  totalBalance: number;
  recentEarned: number;
  recentRedeemed: number;
}

interface RecentTransaction {
  _id: string;
  type: "earn" | "redeem";
  amount: number;
  reason: string;
  createdAt: string;
  studentId: { name: string; uniqueId: string; grade: string };
  recordedBy?: { name: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [studentsRes, txRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/transactions?limit=10"),
      ]);

      if (studentsRes.ok) {
        const students = await studentsRes.json();
        const totalBalance = students.reduce(
          (sum: number, s: { ticketBalance: number }) => sum + s.ticketBalance,
          0
        );
        setStats({
          totalStudents: students.length,
          totalBalance,
          recentEarned: 0,
          recentRedeemed: 0,
        });
      }

      if (txRes.ok) {
        const transactions = await txRes.json();
        setRecent(transactions);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-bca-dark">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Good Friend Store Ticket Tracker</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-heading font-bold text-bca-teal">
              {stats?.totalStudents || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Active Students</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-heading font-bold text-bca-blue">
              {stats?.totalBalance || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Tickets</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-heading font-bold text-green-600">
              {recent.filter((t) => t.type === "earn").reduce((s, t) => s + t.amount, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Recently Earned</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-heading font-bold text-bca-red">
              {recent.filter((t) => t.type === "redeem").reduce((s, t) => s + t.amount, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Recently Redeemed</div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link href="/tickets/add">
          <Card hover>
            <CardBody className="text-center py-6">
              <div className="w-12 h-12 bg-bca-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-bca-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-bca-dark">Add Tickets</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/tickets/redeem">
          <Card hover>
            <CardBody className="text-center py-6">
              <div className="w-12 h-12 bg-bca-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-bca-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-bca-dark">Redeem</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/students/new">
          <Card hover>
            <CardBody className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-bca-dark">New Student</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/qr">
          <Card hover>
            <CardBody className="text-center py-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-bca-dark">QR Codes</p>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-bca-dark">Recent Activity</h2>
          <Link href="/reports" className="text-sm text-bca-teal hover:underline">
            View Reports
          </Link>
        </div>
        <CardBody className="p-0">
          {recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No activity yet. Start by adding students and tickets!
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((tx) => (
                <div key={tx._id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "earn"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-bca-red"
                    }`}
                  >
                    {tx.type === "earn" ? "+" : "-"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bca-dark truncate">
                      {tx.studentId?.name || "Unknown"}{" "}
                      <span className="text-gray-400 font-normal">
                        {tx.type === "earn" ? "earned" : "redeemed"} {tx.amount} ticket{tx.amount > 1 ? "s" : ""}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.reason} &middot; {timeAgo(tx.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      tx.type === "earn" ? "text-green-600" : "text-bca-red"
                    }`}
                  >
                    {tx.type === "earn" ? "+" : "-"}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
