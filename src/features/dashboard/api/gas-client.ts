import { StockIdea, StockIdeaInput } from "../types";

function getGasUrl(): string {
  const url = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL;
  if (!url) {
    console.warn("NEXT_PUBLIC_GAS_WEB_APP_URL is not set.");
    return "";
  }
  return url;
}

export async function fetchStockIdeas(): Promise<StockIdea[]> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return [];

  try {
    const response = await fetch(gasUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();

    if (json.success && Array.isArray(json.data)) {
      return (
        json.data
          // 引数 item, index、および戻り値の型を明記し、暗黙の any (ts(7006)) を防止
          .map((item: unknown, index: number): StockIdea | null => {
            let row: unknown[] = [];

            if (Array.isArray(item)) {
              row = item;
            } else if (
              item !== null &&
              typeof item === "object" &&
              "id" in item &&
              Array.isArray((item as Record<string, unknown>).id)
            ) {
              row = (item as Record<string, unknown>).id as unknown[];
            } else {
              return null; // 想定外のデータはスキップ
            }

            if (row.length === 0) return null;

            // インデックス  で配列の1列目 (id) にアクセス
            const rawId = row;

            // typeof で string 型であることを確認してから比較し、型の重複エラー (ts(2367)) を回避
            if (typeof rawId === "string" && rawId === "id") {
              return null; // ヘッダー行を除外
            }

            const parsedId = typeof rawId === "number" ? rawId : Number(rawId);
            const validId = Number.isNaN(parsedId)
              ? Date.now() + index
              : parsedId;

            // スプレッドシートの列定義に従い、インデックス ([1], [2]...) を用いて各要素へアクセス
            return {
              id: validId,
              details: String(row[1] || ""),
              unknownWords: String(row[2] || "[]"),
              relatedLinks: String(row[3] || "[]"),
              ownWords: String(row[4] || ""),
              metaphor: String(row[5] || ""),
              categories: String(row[6] || "[]"),
              isUsed: Boolean(row[7] || false),
              draftUrl: String(row[8] || ""),
              createdAt: String(row[9] || ""),
              updatedAt: String(row[10] || ""),
              technicalUnderstanding: String(row[11] || ""),
              thinkingTraining: String(row[12] || ""),
              activeMode: String(row[13] || ""),
            };
          })
          // フィルタリング関数の引数と Type Guard の型を明記し、安全に null を除外
          .filter((idea: StockIdea | null): idea is StockIdea => idea !== null)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching ideas from GAS:", error);
    return [];
  }
}

export async function createStockIdea(
  data: Omit<
    StockIdea,
    "id" | "isUsed" | "draftUrl" | "createdAt" | "updatedAt"
  >,
): Promise<StockIdea | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_stock",
        ...data,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    if (json.success) {
      return json.data as StockIdea;
    }
    return null;
  } catch (error) {
    console.error("Error adding stock to GAS:", error);
    return null;
  }
}

// データ追加 (POST)
export async function addStockIdea(
  data: StockIdeaInput,
): Promise<StockIdea | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      // CORS回避のため text/plain を使用
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
      body: JSON.stringify({ action: "add_stock", ...data }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // GAS側からのレスポンスをJSONとしてパース
    const text = await response.text();
    const json = JSON.parse(text);

    if (json.success) {
      return json.data as StockIdea;
    }
    return null;
  } catch (error) {
    console.error("Error adding stock to GAS:", error);
    return null;
  }
}
