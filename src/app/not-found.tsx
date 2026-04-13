import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bca-light">
      <div className="text-center">
        <div className="w-20 h-20 bg-bca-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-heading font-bold text-bca-teal">?</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-bca-dark mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2.5 bg-bca-teal hover:bg-bca-teal-hover text-white font-medium rounded-lg transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
