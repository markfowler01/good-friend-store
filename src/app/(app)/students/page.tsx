"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import StudentCard from "@/components/students/StudentCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const grades = ["All", "K", "1", "2", "3", "4", "5"];

interface Student {
  _id: string;
  name: string;
  grade: string;
  uniqueId: string;
  ticketBalance: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("All");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (grade !== "All") params.set("grade", grade);

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, [search, grade]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bca-dark">Students</h1>
        <Link href="/students/new">
          <Button>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </Button>
        </Link>
      </div>

      <SearchBar
        onChange={setSearch}
        placeholder="Search students by name..."
        className="mb-4"
      />

      {/* Grade filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setGrade(g)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap",
              grade === g
                ? "bg-bca-teal text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}
          >
            {g === "All" ? "All Grades" : g === "K" ? "Kindergarten" : `Grade ${g}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">No students found</p>
          <Link href="/students/new">
            <Button className="mt-4">Add Your First Student</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <StudentCard key={student._id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
