"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, Suspense } from "react";
import InstallPrompt from "@/components/ui/InstallPrompt";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      name,
      code,
      redirect: false,
    });

    if (result?.error) {
      setError("Wrong access code. Ask your group leader for the code.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <InstallPrompt />
      <div className="w-full max-w-md mx-4">
      <div className="relative bg-white rounded-2xl shadow-lg p-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bca-teal via-bca-accent to-bca-teal" />
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 bg-bca-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-bca-accent rounded-full border-4 border-white" />
          </div>
          <span className="eyebrow mb-3">Bethany Christian Assembly</span>
          <h1 className="text-2xl font-heading font-bold text-bca-dark mt-3">Good Friend Store</h1>
          <p className="text-gray-400 mt-1 text-xs uppercase tracking-widest font-mono">Ticket Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-bca-red text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bca-teal focus:border-transparent outline-none transition"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bca-teal focus:border-transparent outline-none transition"
              placeholder="Enter the access code"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bca-teal hover:bg-bca-teal-hover text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 shadow-[0_4px_20px_rgba(205,68,25,0.25)] hover:shadow-[0_6px_28px_rgba(205,68,25,0.4)]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Live. Love. Lead. Like Jesus.
        </p>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
