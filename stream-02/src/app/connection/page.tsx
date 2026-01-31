"use client";

import Link from "next/link";
import { useState } from "react";
import { testConnections } from "./actions";

type ConnectionStatus = {
  ssh: { status: "idle" | "testing" | "success" | "error"; message?: string };
  wpcli: {
    status: "idle" | "testing" | "success" | "error";
    version?: string;
    message?: string;
  };
  rest: {
    status: "idle" | "testing" | "success" | "error";
    endpoint?: string;
    message?: string;
  };
};

function StatusIndicator({
  status,
}: {
  status: "idle" | "testing" | "success" | "error";
}) {
  const colors = {
    idle: "bg-gray-300",
    testing: "bg-yellow-400 animate-pulse",
    success: "bg-green-500",
    error: "bg-red-500",
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status]}`} />;
}

export default function ConnectionPage() {
  const [connections, setConnections] = useState<ConnectionStatus>({
    ssh: { status: "idle" },
    wpcli: { status: "idle" },
    rest: { status: "idle" },
  });
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setConnections({
      ssh: { status: "testing" },
      wpcli: { status: "testing" },
      rest: { status: "testing" },
    });

    try {
      const results = await testConnections();
      setConnections({
        ssh: results.ssh.success
          ? { status: "success" }
          : { status: "error", message: results.ssh.error },
        wpcli: results.wpcli.success
          ? { status: "success", version: results.wpcli.version }
          : { status: "error", message: results.wpcli.error },
        rest: results.rest.success
          ? { status: "success", endpoint: results.rest.endpoint }
          : { status: "error", message: results.rest.error },
      });
    } catch {
      setConnections({
        ssh: { status: "error", message: "Test failed" },
        wpcli: { status: "error", message: "Test failed" },
        rest: { status: "error", message: "Test failed" },
      });
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Connection Test</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>

        <button
          onClick={runTests}
          disabled={testing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mb-6 hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? "Testing..." : "Test All"}
        </button>

        <div className="space-y-4">
          {/* SSH */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <StatusIndicator status={connections.ssh.status} />
              SSH Connection
            </h2>
            {connections.ssh.status === "success" && (
              <p className="text-sm text-green-600">Connected</p>
            )}
            {connections.ssh.status === "error" && (
              <p className="text-sm text-red-600">{connections.ssh.message}</p>
            )}
          </div>

          {/* WP-CLI */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <StatusIndicator status={connections.wpcli.status} />
              WP-CLI
            </h2>
            {connections.wpcli.status === "success" && (
              <p className="text-sm text-green-600">
                Version: {connections.wpcli.version}
              </p>
            )}
            {connections.wpcli.status === "error" && (
              <p className="text-sm text-red-600">{connections.wpcli.message}</p>
            )}
          </div>

          {/* REST API */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <StatusIndicator status={connections.rest.status} />
              REST API
            </h2>
            {connections.rest.status === "success" && (
              <p className="text-sm text-green-600">
                Endpoint: {connections.rest.endpoint}
              </p>
            )}
            {connections.rest.status === "error" && (
              <p className="text-sm text-red-600">{connections.rest.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
