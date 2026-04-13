"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
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
  const [amount, setAmount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!selectedStudent) return;

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
        `Redeemed ${amount} ticket${amount > 1 ? "s" : ""} from ${selectedStudent.name}. Remaining balance: ${data.newBalance}`
      );
      setSelectedStudent(null);
      setAmount(1);
      setShowConfirm(false);
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem tickets");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Redeem Tickets</h1>

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-bca-red text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Selected Student Display */}
      {selectedStudent ? (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-heading font-bold text-lg">
                {selectedStudent.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-heading font-bold text-bca-dark">
                  {selectedStudent.name}
                </h2>
                <Badge variant="gray">
                  {selectedStudent.grade === "K" ? "K" : `Grade ${selectedStudent.grade}`}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-bca-teal">
                  {selectedStudent.ticketBalance}
                </div>
                <div className="text-xs text-gray-400">available</div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Redeem Controls */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tickets to Redeem
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                    className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        Math.max(
                          1,
                          Math.min(
                            selectedStudent.ticketBalance,
                            parseInt(e.target.value) || 1
                          )
                        )
                      )
                    }
                    className="w-24 text-center text-3xl font-bold border border-gray-300 rounded-lg py-2 outline-none focus:ring-2 focus:ring-bca-teal"
                    min="1"
                    max={selectedStudent.ticketBalance}
                  />
                  <button
                    onClick={() =>
                      setAmount(Math.min(selectedStudent.ticketBalance, amount + 1))
                    }
                    className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Remaining after: {selectedStudent.ticketBalance - amount} tickets
                </p>
              </div>

              <Button
                onClick={() => setShowConfirm(true)}
                disabled={amount < 1 || amount > selectedStudent.ticketBalance}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Redeem {amount} Ticket{amount > 1 ? "s" : ""}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Student Search */
        <Card>
          <CardHeader>
            <h2 className="font-heading font-semibold text-bca-dark">
              Find Student
            </h2>
          </CardHeader>
          <CardBody>
            <SearchBar
              onChange={setSearch}
              placeholder="Search by name or ID..."
              className="mb-3"
            />

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => { setSelectedStudent(student); setAmount(1); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition"
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
                      <div className="text-lg font-bold text-bca-teal">
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

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Redemption"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Student</span>
                <span className="font-medium">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Balance</span>
                <span className="font-medium">{selectedStudent.ticketBalance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Redeeming</span>
                <span className="font-medium text-bca-red">-{amount}</span>
              </div>
              <hr />
              <div className="flex justify-between text-sm font-bold">
                <span>New Balance</span>
                <span className="text-bca-teal">{selectedStudent.ticketBalance - amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRedeem}
                loading={submitting}
                variant="secondary"
                className="flex-1"
              >
                Confirm
              </Button>
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
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
