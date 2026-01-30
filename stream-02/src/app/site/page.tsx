"use client";

import Link from "next/link";
import { useState } from "react";
import { createSite } from "./actions";

export default function SitePage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createSite({ slug, title, email });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(
        JSON.stringify(
          {
            success: false,
            error: {
              code: "UNKNOWN",
              message: error instanceof Error ? error.message : "Unknown error",
            },
          },
          null,
          2
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Site Create Test</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">Input</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="test-001"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Test Blog"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Site"}
          </button>
        </form>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
