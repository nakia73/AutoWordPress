"use server";

// Stream02: WordPressセットアップ
// テスト目的: WordPressがセットアップできるか

import { WordPressSetupManager } from "@/lib/wordpress";

export async function setupSite(input: {
  slug: string;
  title: string;
  email: string;
}) {
  try {
    const manager = new WordPressSetupManager();
    return await manager.setupSite(input);
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
