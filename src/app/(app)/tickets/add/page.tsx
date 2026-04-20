"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import SearchBar from "@/components/ui/SearchBar";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const DEFAULT_REASON = "Tickets earned";

interface Student {
  _id: string;
  name: string;
  grade: string;
  uniqueId: string;
  ticketBalance: number;
}

function AddTicketsContent() {
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams.get("student");

  const [mode, setMode] = useState<"individual" | "bulk">("individual");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [amount, setAmount] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newStartingTickets, setNewStartingTickets] = useState(0);
  const [creatingStudent, setCreatingStudent] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (gradeFilter !== "All") params.set("grade", gradeFilter);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, [search, gradeFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Auto-select student from QR code
  useEffect(() => {
    if (preselectedStudent && students.length > 0) {
      const student = students.find((s) => s.uniqueId === preselectedStudent);
      if (student && !selectedStudents.find((s) => s._id === student._id)) {
        setSelectedStudents([student]);
      }
    }
  }, [preselectedStudent, students, selectedStudents]);

  function toggleStudent(student: Student) {
    setSelectedStudents((prev) => {
      const exists = prev.find((s) => s._id === student._id);
      if (exists) {
        return prev.filter((s) => s._id !== student._id);
      }
      if (mode === "individual") {
        return [student];
      }
      return [...prev, student];
    });
  }

  function selectAllVisible() {
    setSelectedStudents(students);
  }

  function deselectAll() {
    setSelectedStudents([]);
  }

  function openNewStudentModal() {
    setNewName(search.trim());
    setNewGrade("");
    setNewBarcode("");
    setNewStartingTickets(0);
    setError("");
    setShowNewStudentModal(true);
  }

  async function createStudent() {
    if (!newName.trim()) {
      setError("Name is required");
      return;
    }
    setCreatingStudent(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          grade: newGrade || undefined,
          barcodeId: newBarcode.trim() || undefined,
          startingTickets: newStartingTickets,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create student");
      }
      const created = (await res.json()) as Student;
      setStudents((prev) => [created, ...prev]);
      setSelectedStudents((prev) =>
        mode === "individual" ? [created] : [...prev, created]
      );
      setShowNewStudentModal(false);
      setSuccess(`Added ${created.name} — now pick tickets to give them.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
    } finally {
      setCreatingStudent(false);
    }
  }

  async function handleSubmit() {
    if (selectedStudents.length === 0 || amount < 1) {
      setError("Please select students and an amount");
      return;
    }

    const finalReason = DEFAULT_REASON;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (selectedStudents.length === 1) {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudents[0]._id,
            type: "earn",
            amount,
            reason: finalReason,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        const data = await res.json();
        setSuccess(
          `Added ${amount} ticket${amount > 1 ? "s" : ""} to ${selectedStudents[0].name}. New balance: ${data.newBalance}`
        );
      } else {
        const res = await fetch("/api/transactions/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentIds: selectedStudents.map((s) => s._id),
            amount,
            reason: finalReason,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setSuccess(
          `Added ${amount} ticket${amount > 1 ? "s" : ""} to ${selectedStudents.length} students!`
        );
      }
      setSelectedStudents([]);
      setAmount(3);
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tickets");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Add Tickets</h1>

      {/* Mode Toggle */}
      <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-6 max-w-xs">
        <button
          onClick={() => { setMode("individual"); setSelectedStudents([]); }}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition",
            mode === "individual" ? "bg-bca-teal text-white" : "text-gray-600"
          )}
        >
          Individual
        </button>
        <button
          onClick={() => { setMode("bulk"); setSelectedStudents([]); }}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition",
            mode === "bulk" ? "bg-bca-teal text-white" : "text-gray-600"
          )}
        >
          Bulk Add
        </button>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3 overflow-hidden">
        {/* Student Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-bca-dark">
                  Select Student{mode === "bulk" ? "s" : ""}
                </h2>
                {mode === "bulk" && (
                  <div className="flex gap-2">
                    <button onClick={selectAllVisible} className="text-xs text-bca-teal hover:underline">
                      Select All
                    </button>
                    <button onClick={deselectAll} className="text-xs text-gray-400 hover:underline">
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex gap-2 mb-3">
                <SearchBar
                  onChange={setSearch}
                  placeholder="Search by name..."
                  className="flex-1"
                />
                <button
                  onClick={openNewStudentModal}
                  className="flex items-center gap-1.5 bg-bca-accent hover:bg-bca-accent-hover text-white text-sm font-medium py-2 px-3 rounded-lg shadow-[0_4px_16px_rgba(205,68,25,0.2)] hover:shadow-[0_6px_22px_rgba(205,68,25,0.35)] transition shrink-0"
                  title="Add new student"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">New</span>
                </button>
              </div>

              {mode === "bulk" && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {["All", "K", "1", "2", "3", "4", "5"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition",
                        gradeFilter === g
                          ? "bg-bca-teal text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {g === "All" ? "All" : g === "K" ? "K" : `Gr ${g}`}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-3">
                    {search ? `No students matching "${search}"` : "No students yet"}
                  </p>
                  <button
                    onClick={openNewStudentModal}
                    className="inline-flex items-center gap-1.5 bg-bca-accent hover:bg-bca-accent-hover text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {search ? `Add "${search}" as new student` : "Add new student"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {students.map((student) => {
                    const isSelected = selectedStudents.some(
                      (s) => s._id === student._id
                    );
                    return (
                      <button
                        key={student._id}
                        onClick={() => toggleStudent(student)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition",
                          isSelected
                            ? "bg-bca-teal/10 border-2 border-bca-teal"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-bold text-xs">
                          {student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-bca-dark truncate">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="gray">{student.grade === "K" ? "K" : `Gr ${student.grade}`}</Badge>
                            <span className="text-xs text-gray-400">{student.ticketBalance} tickets</span>
                          </div>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-bca-teal" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Ticket Details */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <h2 className="font-heading font-semibold text-bca-dark">Ticket Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {selectedStudents.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-bca-teal">{selectedStudents.length}</span>
                  {" "}student{selectedStudents.length > 1 ? "s" : ""} selected
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center text-2xl font-bold border border-gray-300 rounded-lg py-2 outline-none focus:ring-2 focus:ring-bca-teal"
                    min="1"
                  />
                  <button
                    onClick={() => setAmount(amount + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition shrink-0"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setAmount(amount + 3)}
                    className="h-10 px-3 rounded-lg bg-bca-teal/10 hover:bg-bca-teal/20 text-bca-teal text-sm font-bold transition shrink-0"
                  >
                    +3
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={selectedStudents.length === 0}
                className="w-full"
                size="lg"
              >
                Add {amount} Ticket{amount > 1 ? "s" : ""}
                {selectedStudents.length > 1 && ` to ${selectedStudents.length} Students`}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={showNewStudentModal}
        onClose={() => setShowNewStudentModal(false)}
        title="Add new student"
      >
        <div className="space-y-4">
          <Input
            id="new-name"
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="First Last"
            autoFocus
            required
          />
          <Select
            id="new-grade"
            label="Grade (optional)"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            options={[
              { value: "", label: "Unknown / skip" },
              { value: "K", label: "Kindergarten" },
              { value: "1", label: "Grade 1" },
              { value: "2", label: "Grade 2" },
              { value: "3", label: "Grade 3" },
              { value: "4", label: "Grade 4" },
              { value: "5", label: "Grade 5" },
            ]}
          />
          <Input
            id="new-barcode"
            label="Barcode ID (optional)"
            value={newBarcode}
            onChange={(e) => setNewBarcode(e.target.value)}
            placeholder="51xxx"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting tickets (optional)
            </label>
            <input
              type="number"
              value={newStartingTickets}
              onChange={(e) => setNewStartingTickets(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-bca-accent"
            />
          </div>
          {error && (
            <div className="bg-red-50 text-bca-red text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowNewStudentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={createStudent}
              loading={creatingStudent}
              disabled={!newName.trim()}
              className="flex-1 bg-bca-accent hover:bg-bca-accent-hover text-white"
            >
              Add & Select
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AddTicketsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
      <AddTicketsContent />
    </Suspense>
  );
}
