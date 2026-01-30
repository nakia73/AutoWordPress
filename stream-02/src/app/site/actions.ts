"use server";

import { WordPressManager } from "@/lib/wordpress";

export async function createSite(input: {
  slug: string;
  title: string;
  email: string;
}) {
  try {
    const manager = new WordPressManager();
    return await manager.createSite(input);
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN" as const,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
