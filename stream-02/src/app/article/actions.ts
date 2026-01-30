"use server";

import { WordPressManager } from "@/lib/wordpress";

export async function postArticle(input: {
  siteUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  article: {
    title: string;
    content: string;
    status: "publish" | "draft";
  };
}) {
  try {
    const manager = new WordPressManager();
    return await manager.postArticle(input);
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
