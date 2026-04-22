"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function SuggestButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), pageContext: pathname }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send suggestion");
      }
      setSent(true);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setOpen(false);
    // reset after close animation
    setTimeout(() => {
      setSent(false);
      setError("");
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          compact
            ? "text-gray-300 hover:text-bca-accent text-sm font-nav transition"
            : "inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-bca-accent transition"
        }
        title="Suggest an idea"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>Suggest</span>
      </button>

      <Modal open={open} onClose={close} title="Suggest an idea">
        {sent ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-bca-accent/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-bca-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-bca-dark font-medium">Thanks — got it!</p>
            <p className="text-sm text-gray-500">
              Mark will see this and follow up if needed.
            </p>
            <Button onClick={close} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              What would make this app better? Bugs, ideas, confusing flows — all welcome.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Example: It would be great if the redeem screen showed the kid's photo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-bca-accent focus:border-transparent text-sm"
              autoFocus
            />
            <div className="text-xs text-gray-400 text-right">
              {text.length}/2000
            </div>
            {error && (
              <div className="bg-red-50 text-bca-red text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={close} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={submit}
                loading={submitting}
                disabled={!text.trim()}
                className="flex-1 bg-bca-accent hover:bg-bca-accent-hover text-white"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
