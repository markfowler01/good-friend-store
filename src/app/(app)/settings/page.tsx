"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("helper");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isAdmin = session?.user?.role === "admin";

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create user");
    } else {
      setSuccess(`User ${email} created successfully!`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("helper");
    }
    setLoading(false);
  }

  async function handleExportData() {
    const [studentsRes, txRes] = await Promise.all([
      fetch("/api/students?active=all"),
      fetch("/api/transactions?limit=10000"),
    ]);

    const students = studentsRes.ok ? await studentsRes.json() : [];
    const transactions = txRes.ok ? await txRes.json() : [];

    const data = { students, transactions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `good-friend-store-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-heading font-bold text-bca-dark mb-2">Settings</h1>
        <p className="text-gray-500">Only administrators can access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-bca-dark mb-6">Settings</h1>

      {/* Create User */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-heading font-semibold text-bca-dark">Add Teacher/Helper</h2>
        </CardHeader>
        <CardBody>
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

          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              required
            />
            <Select
              id="role"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "helper", label: "Helper" },
                { value: "teacher", label: "Teacher" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <Button type="submit" loading={loading}>
              Create User
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-bca-dark">Data Management</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Export all student data and transaction history as a JSON backup file.
          </p>
          <Button variant="secondary" onClick={handleExportData}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export All Data
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
