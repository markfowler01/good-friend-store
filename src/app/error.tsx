"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bca-light">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-bca-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-bca-dark mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6">An unexpected error occurred.</p>
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2.5 bg-bca-teal hover:bg-bca-teal-hover text-white font-medium rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
