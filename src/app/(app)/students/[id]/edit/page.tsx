"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

const gradeOptions = [
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
];

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudent() {
      const res = await fetch(`/api/students/${params.id}`);
      if (res.ok) {
        const student = await res.json();
        setName(student.name);
        setGrade(student.grade);
      }
      setLoading(false);
    }
    fetchStudent();
  }, [params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/students/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), grade }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update student");
      setSaving(false);
      return;
    }

    router.push(`/students/${params.id}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Edit Student</h1>

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

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving} className="flex-1">
                Save Changes
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
