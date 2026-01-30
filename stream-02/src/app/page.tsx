import Link from "next/link";

export default function Dashboard() {
  const envVars = {
    VPS_HOST: process.env.VPS_HOST || "not set",
    WP_DOMAIN: process.env.WP_DOMAIN || "not set",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">WordPress Manager - Stub UI</h1>

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
            <p className="text-sm text-gray-500">
              SSH / WP-CLI / REST API接続確認
            </p>
          </Link>

          <Link
            href="/site"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Site Create</h3>
            <p className="text-sm text-gray-500">サイト作成テスト</p>
          </Link>

          <Link
            href="/article"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Article Post</h3>
            <p className="text-sm text-gray-500">記事投稿テスト</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
