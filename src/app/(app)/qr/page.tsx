"use client";

import { useState, useEffect } from "react";
import { QRCode } from "react-qrcode-logo";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

interface Student {
  _id: string;
  name: string;
  grade: string;
  uniqueId: string;
}

export default function QRPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"general" | "students">("general");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch("/api/students");
      if (res.ok) {
        setStudents(await res.json());
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bca-dark">QR Codes</h1>
        <Button onClick={handlePrint} variant="ghost">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-6 max-w-xs">
        <button
          onClick={() => setView("general")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            view === "general" ? "bg-bca-teal text-white" : "text-gray-600"
          }`}
        >
          General QR
        </button>
        <button
          onClick={() => setView("students")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            view === "students" ? "bg-bca-teal text-white" : "text-gray-600"
          }`}
        >
          Per Student
        </button>
      </div>

      {view === "general" ? (
        <Card className="max-w-sm mx-auto">
          <CardBody className="text-center py-8">
            <h2 className="font-heading font-semibold text-bca-dark mb-4">
              Scan to Add Tickets
            </h2>
            <div className="inline-block p-4 bg-white rounded-xl shadow-sm">
              <QRCode
                value={`${baseUrl}/tickets/add`}
                size={200}
                fgColor="#0bb4aa"
                bgColor="#ffffff"
                qrStyle="dots"
                eyeRadius={8}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Scan this QR code to open the ticket entry form
            </p>
            <p className="text-xs text-gray-400 mt-1 break-all">
              {baseUrl}/tickets/add
            </p>
          </CardBody>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4">
          {students.map((student) => (
            <Card key={student._id} className="print:break-inside-avoid">
              <CardBody className="text-center py-4">
                <QRCode
                  value={`${baseUrl}/tickets/add?student=${student.uniqueId}`}
                  size={120}
                  fgColor="#0bb4aa"
                  bgColor="#ffffff"
                  qrStyle="dots"
                  eyeRadius={6}
                />
                <p className="text-sm font-medium text-bca-dark mt-2">
                  {student.name}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Badge variant="gray">{student.grade === "K" ? "K" : `Gr ${student.grade}`}</Badge>
                  <span className="text-xs text-gray-400">#{student.uniqueId}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
