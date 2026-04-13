"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  grade: string;
  uniqueId: string;
  ticketBalance: number;
  createdAt: string;
}

interface Transaction {
  _id: string;
  type: "earn" | "redeem";
  amount: number;
  reason: string;
  serviceDate: string;
  createdAt: string;
  recordedBy?: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [studentRes, txRes] = await Promise.all([
        fetch(`/api/students/${params.id}`),
        fetch(`/api/students/${params.id}/transactions`),
      ]);

      if (studentRes.ok) {
        setStudent(await studentRes.json());
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Link href="/students">
          <Button className="mt-4" variant="ghost">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Student Info Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-heading font-bold text-xl">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-bold text-bca-dark">{student.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gray">
                  {student.grade === "K" ? "Kindergarten" : `Grade ${student.grade}`}
                </Badge>
                <span className="text-sm text-gray-400">ID: {student.uniqueId}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-bca-teal">
                {student.ticketBalance}
              </div>
              <div className="text-sm text-gray-400">tickets</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-6">
            <Link href={`/tickets/add?student=${student.uniqueId}`} className="flex-1">
              <Button className="w-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Tickets
              </Button>
            </Link>
            <Link href={`/tickets/redeem?student=${student.uniqueId}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Redeem
              </Button>
            </Link>
            <Link href={`/students/${student._id}/edit`}>
              <Button variant="ghost">Edit</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-bca-dark">Transaction History</h2>
        </CardHeader>
        <CardBody className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx._id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "earn"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-bca-red"
                    }`}
                  >
                    {tx.type === "earn" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bca-dark">{tx.reason}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.serviceDate)}
                      {tx.recordedBy && ` \u2022 by ${tx.recordedBy}`}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
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
