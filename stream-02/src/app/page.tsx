import Link from "next/link";

// Stream02: WordPress Setup - Stub UI
// テスト目的: WordPressがセットアップでき、記事投稿機能が動作するか
// 記事投稿テストにはMockデータを使用（Stream01の出力は使用しない）

export default function Dashboard() {
  const envVars = {
    VPS_HOST: process.env.VPS_HOST || "not set",
    WP_DOMAIN: process.env.WP_DOMAIN || "not set",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">WordPress Setup - Stub UI</h1>
        <p className="text-sm text-gray-500 mb-6">
          Stream02: WordPressセットアップのテスト
        </p>

        {/* Environment */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Environment</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex">
              <span className="text-gray-500 w-32">VPS_HOST:</span>
              <span>{envVars.VPS_HOST}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-32">WP_DOMAIN:</span>
              <span>{envVars.WP_DOMAIN}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/connection"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Connection Test</h3>
            <p className="text-sm text-gray-500">SSH / WP-CLI 接続確認</p>
          </Link>

          <Link
            href="/site"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Site Setup</h3>
            <p className="text-sm text-gray-500">
              サブサイト作成・認証情報発行
            </p>
          </Link>

          <Link
            href="/article"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow col-span-2"
          >
            <h3 className="font-semibold mb-2">Article Post Test</h3>
            <p className="text-sm text-gray-500">
              記事投稿機能テスト（Mockデータ使用）
            </p>
          </Link>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-800 mb-1">Stream02のテスト範囲</p>
          <p className="text-blue-700">
            このUIではWordPressセットアップと記事投稿機能の動作を検証します。
            記事投稿テストには<strong>Mockデータ</strong>を使用します（実記事生成はStream01の責務）。
          </p>
        </div>
      </div>
    </div>
  );
}
