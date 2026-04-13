"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

interface Student {
  _id: string;
  name: string;
  grade: string;
  uniqueId: string;
  ticketBalance: number;
}

function RedeemContent() {
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams.get("student");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (preselectedStudent && students.length > 0 && !selectedStudent) {
      const student = students.find((s) => s.uniqueId === preselectedStudent);
      if (student) setSelectedStudent(student);
    }
  }, [preselectedStudent, students, selectedStudent]);

  async function handleRedeem() {
    if (!selectedStudent || amount < 1) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          type: "redeem",
          amount,
          reason: "Store Redemption",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      setSuccess(
        `Done! ${selectedStudent.name} spent ${amount} ticket${amount > 1 ? "s" : ""}. Remaining: ${data.newBalance}`
      );
      setSelectedStudent(null);
      setAmount(0);
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem tickets");
    } finally {
      setSubmitting(false);
    }
  }

  // Quick-spend buttons
  const quickAmounts = [1, 2, 3, 5, 10];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-2">Store Checkout</h1>
      <p className="text-sm text-gray-500 mb-6">Tap a student, pick how many tickets to spend</p>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-center font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-bca-red px-4 py-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {/* Selected Student - big prominent display */}
      {selectedStudent ? (
        <>
          <Card className="mb-4">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-heading font-bold text-lg">
                    {selectedStudent.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-bca-dark">
                      {selectedStudent.name}
                    </h2>
                    <Badge variant="gray">
                      {selectedStudent.grade === "K" ? "K" : `Grade ${selectedStudent.grade}`}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedStudent(null); setAmount(0); }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Big balance display */}
              <div className="text-center my-6">
                <div className="text-5xl font-heading font-bold text-bca-teal">
                  {selectedStudent.ticketBalance}
                </div>
                <div className="text-sm text-gray-400 mt-1">tickets available</div>
              </div>

              {/* Quick spend buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many tickets to spend?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setAmount(qty)}
                      disabled={qty > selectedStudent.ticketBalance}
                      className={`py-3 rounded-lg text-lg font-bold transition ${
                        amount === qty
                          ? "bg-bca-teal text-white"
                          : qty > selectedStudent.ticketBalance
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Or enter custom:</span>
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e) =>
                    setAmount(
                      Math.max(0, Math.min(selectedStudent.ticketBalance, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-20 text-center text-lg font-bold border border-gray-300 rounded-lg py-2 outline-none focus:ring-2 focus:ring-bca-teal"
                  min="0"
                  max={selectedStudent.ticketBalance}
                  placeholder="0"
                />
              </div>

              {/* Result preview */}
              {amount > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between text-sm">
                  <span className="text-gray-500">After spending {amount}:</span>
                  <span className="font-bold text-bca-teal">
                    {selectedStudent.ticketBalance - amount} remaining
                  </span>
                </div>
              )}

              {/* Big redeem button */}
              <Button
                onClick={handleRedeem}
                loading={submitting}
                disabled={amount < 1 || amount > selectedStudent.ticketBalance}
                variant="danger"
                size="lg"
                className="w-full text-lg"
              >
                Spend {amount || 0} Ticket{amount !== 1 ? "s" : ""}
              </Button>
            </CardBody>
          </Card>
        </>
      ) : (
        /* Student Search - simple tap-to-select list */
        <Card>
          <CardBody>
            <SearchBar
              onChange={setSearch}
              placeholder="Search student name..."
              className="mb-3"
            />

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No students found</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => { setSelectedStudent(student); setAmount(0); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition active:bg-bca-teal/10"
                  >
                    <div className="w-10 h-10 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-bold text-xs">
                      {student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bca-dark truncate">
                        {student.name}
                      </p>
                      <Badge variant="gray">
                        {student.grade === "K" ? "K" : `Gr ${student.grade}`}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-bca-teal">
                        {student.ticketBalance}
                      </div>
                      <div className="text-xs text-gray-400">tickets</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
      <RedeemContent />
    </Suspense>
  );
}
