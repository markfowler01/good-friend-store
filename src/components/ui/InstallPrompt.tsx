"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop" | "unsupported";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unsupported";
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  if (isIOS) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/Mac|Win|Linux/.test(ua)) return "desktop";
  return "unsupported";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const DISMISS_KEY = "gf-install-dismissed";
const DISMISS_DAYS = 14;

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("unsupported");
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const ageDays = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (ageDays < DISMISS_DAYS) {
        setDismissed(true);
        return;
      }
    }

    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || isStandalone() || platform === "unsupported") return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  }

  return (
    <>
      {/* Compact banner */}
      <div className="w-full max-w-md mx-4 mb-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-bca-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-bca-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-bca-dark">Install on your phone</div>
            <div className="text-xs text-gray-500">One tap next time — no typing</div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium bg-bca-accent hover:bg-bca-accent-hover text-white py-1.5 px-3 rounded-lg transition flex-shrink-0"
          >
            Show me
          </button>
          <button
            onClick={dismiss}
            className="text-gray-300 hover:text-gray-500 p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal with full instructions */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-bca-teal via-bca-accent to-bca-teal" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs tracking-[0.2em] uppercase text-bca-accent font-bold">
                    Install App
                  </div>
                  <h2 className="text-xl font-heading font-bold text-bca-dark mt-1">
                    Put it on your home screen
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {platform === "ios" && (
                <ol className="space-y-4 text-sm text-bca-dark">
                  <Step num={1}>
                    Tap the <strong>Share</strong> button at the bottom of Safari
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-md mx-1 align-middle">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
                      </svg>
                    </span>
                  </Step>
                  <Step num={2}>
                    Scroll and tap <strong>Add to Home Screen</strong>
                  </Step>
                  <Step num={3}>
                    Tap <strong>Add</strong> in the top right
                  </Step>
                  <Step num={4}>
                    You&apos;re done! Tap the Good Friend icon on your home screen any time.
                  </Step>
                </ol>
              )}

              {platform === "android" && (
                <>
                  {deferredPrompt ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Tap the button below and confirm to install.
                      </p>
                      <button
                        onClick={handleAndroidInstall}
                        className="w-full bg-bca-accent hover:bg-bca-accent-hover text-white font-medium py-3 px-4 rounded-lg transition shadow-[0_4px_20px_rgba(205,68,25,0.25)]"
                      >
                        Install Good Friend Store
                      </button>
                    </div>
                  ) : (
                    <ol className="space-y-4 text-sm text-bca-dark">
                      <Step num={1}>Tap the <strong>⋮</strong> menu in the top right of Chrome</Step>
                      <Step num={2}>Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>)</Step>
                      <Step num={3}>Tap <strong>Install</strong> to confirm</Step>
                      <Step num={4}>
                        Done! Tap the Good Friend icon on your home screen any time.
                      </Step>
                    </ol>
                  )}
                </>
              )}

              {platform === "desktop" && (
                <div className="space-y-3 text-sm text-bca-dark">
                  <p>
                    You&apos;re on a computer. To install the app, open this site on
                    your <strong>phone</strong> — Safari on iPhone, Chrome on Android.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Or look for an install icon in your browser&apos;s address bar.
                  </p>
                </div>
              )}

              <button
                onClick={dismiss}
                className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Don&apos;t show this again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 bg-bca-accent text-white rounded-full flex items-center justify-center text-xs font-bold">
        {num}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}
