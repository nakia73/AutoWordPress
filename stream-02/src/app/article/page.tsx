"use client";

import Link from "next/link";
import { useState } from "react";
import { postArticle } from "./actions";

export default function ArticlePage() {
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [content, setContent] = useState("<p>This is test content.</p>");
  const [status, setStatus] = useState<"publish" | "draft">("publish");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await postArticle({
        siteUrl,
        credentials: { username, password },
        article: {
          title: articleTitle,
          content,
          status,
        },
      });
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
          <h1 className="text-2xl font-bold">Article Post Test</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Site Credentials */}
          <h2 className="font-semibold mb-4">Site</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://test-001.argonote.app"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (Application Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Article */}
          <h2 className="font-semibold mb-4">Article</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="Test Article"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "publish"}
                    onChange={() => setStatus("publish")}
                    className="mr-2"
                  />
                  Publish
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className="mr-2"
                  />
                  Draft
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Article"}
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
