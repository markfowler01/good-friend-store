"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

const gradeOptions = [
  { value: "", label: "Select a grade" },
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
];

export default function NewStudentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [startingTickets, setStartingTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !grade) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        grade,
        startingTickets: startingTickets || 0,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create student");
      setLoading(false);
      return;
    }

    const student = await res.json();
    router.push(`/students/${student._id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Add New Student</h1>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-bca-red text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              id="name"
              label="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student's full name"
              required
            />

            <Select
              id="grade"
              label="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              options={gradeOptions}
              required
            />

            <Input
              id="startingTickets"
              label="Starting Tickets (optional)"
              type="number"
              value={startingTickets || ""}
              onChange={(e) => setStartingTickets(parseInt(e.target.value) || 0)}
              placeholder="0"
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                Add Student
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
