"use server";

import { checkVPSConnection } from "@/lib/vps/ssh-client";
import { WPCLIClient } from "@/lib/vps/wp-cli";

export async function testConnections() {
  const results = {
    ssh: { success: false, error: "" },
    wpcli: { success: false, version: "", error: "" },
    rest: { success: false, endpoint: "", error: "" },
  };

  // SSH Test
  try {
    results.ssh.success = await checkVPSConnection();
  } catch (error) {
    results.ssh.error = error instanceof Error ? error.message : "SSH test failed";
  }

  // WP-CLI Test
  try {
    const wpcli = new WPCLIClient();
    await wpcli.connect();
    results.wpcli.version = await wpcli.getVersion();
    results.wpcli.success = true;
    wpcli.disconnect();
  } catch (error) {
    results.wpcli.error = error instanceof Error ? error.message : "WP-CLI test failed";
  }

  // REST API Test
  try {
    const domain = process.env.WP_DOMAIN || "example.com";
    results.rest.endpoint = `https://${domain}/wp-json`;

    // Simple endpoint check (no auth required)
    const response = await fetch(`${results.rest.endpoint}/wp/v2`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    results.rest.success = response.ok;
    if (!response.ok) {
      results.rest.error = `HTTP ${response.status}`;
    }
  } catch (error) {
    results.rest.error = error instanceof Error ? error.message : "REST API test failed";
  }

  return results;
}
