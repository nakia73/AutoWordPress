"use client";

// Stream02: 記事投稿テスト
// テスト目的: WordPress REST APIへの記事投稿が動作することを確認
// ※ Mockデータを使用（Stream01の出力は使用しない）

import Link from "next/link";
import { useState } from "react";
import { postTestArticle, getMockArticlePreview } from "./actions";

export default function ArticlePage() {
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [withImage, setWithImage] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    content: string;
    status: string;
    hasImage: boolean;
  } | null>(null);

  const handlePreview = async () => {
    const previewData = await getMockArticlePreview(withImage);
    setPreview(previewData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await postTestArticle({
        siteUrl,
        username,
        applicationPassword: password,
        withImage,
        publishImmediately,
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
          <div>
            <h1 className="text-2xl font-bold">Article Post Test</h1>
            <p className="text-sm text-gray-500">
              Mockデータを使用して投稿機能をテスト
            </p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-yellow-800 mb-1">
            Stream02のテスト範囲
          </p>
          <p className="text-sm text-yellow-700">
            このテストでは<strong>Mockデータ</strong>
            を使用します。実際の記事生成（Stream01）とは独立してテストを行います。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="font-semibold mb-4">Site Credentials</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site URL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://test-001.example.com"
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
                Application Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <hr className="my-6" />

          <h2 className="font-semibold mb-4">Test Options</h2>

          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={withImage}
                onChange={(e) => setWithImage(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Include test image</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">
                Publish immediately (default: draft)
              </span>
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
            >
              Preview Mock Data
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Test Article"}
            </button>
          </div>
        </form>

        {preview && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold mb-4">Mock Data Preview</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span> {preview.title}
              </div>
              <div>
                <span className="font-medium">Status:</span> {preview.status}
              </div>
              <div>
                <span className="font-medium">Has Image:</span>{" "}
                {preview.hasImage ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Content Preview:</span>
              </div>
              <div
                className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40"
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </div>
          </div>
        )}

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
