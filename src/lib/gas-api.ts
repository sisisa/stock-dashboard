// GAS（スプレッドシート）と通信するための型定義と関数
// src/features/dashboard/types/index.ts または src/lib/gas-api.ts 内に追加・修正

export interface TechnicalUnderstanding {
  why: string;
  problem: string;
  analogy: string;
  mechanism: string;
  trigger: string;
  without: string;
}
export interface StockIdea {
  id: number;
  details: string;
  technicalUnderstanding: string;
  unknownWords: string; // JSON文字列
  relatedLinks: string; // JSON文字列
  ownWords: string;
  metaphor: string;
  categories: string; // JSON文字列
  isUsed: boolean;
  draftUrl: string;
  createdAt: string;
  updatedAt: string;
}

// 登録用に自動生成項目を除外した型
export type StockIdeaInput = Omit<
  StockIdea,
  "id" | "isUsed" | "draftUrl" | "createdAt" | "updatedAt"
>;

function getGasUrl(): string {
  const url = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL;
  if (!url) {
    console.warn("NEXT_PUBLIC_GAS_WEB_APP_URL is not set.");
  }
  return url || "";
}

export async function addStockIdea(
  data: StockIdeaInput,
): Promise<StockIdea | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      // 【変更点】 application/json から text/plain に変更し、CORSのプリフライトを回避する
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      // redirect: "follow" を明示する（GASの仕様上、リダイレクトを経てレスポンスが返るため）
      redirect: "follow",
      body: JSON.stringify({
        action: "add_stock",
        ...data,
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (json.success) {
      return json.data as StockIdea;
    }
    console.error("GAS API Error:", json.error);
    return null;
  } catch (err) {
    console.error("Error adding stock to GAS:", err);
    return null;
  }
}
