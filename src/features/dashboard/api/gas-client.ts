// import { StockIdea, StockIdeaInput } from "../types";

import type { ActiveMode } from "../types/common";
import type { StockIdea, StockIdeaInput } from "../types/database";

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
      const result = json.data
        .map((item: unknown, index: number): StockIdea | null => {
          let row: unknown[] = [];

          // 入力データの正規化 (配列直接、またはidプロパティに配列が入っているケースに対応)
          if (Array.isArray(item)) {
            row = item;
          } else if (
            item !== null &&
            typeof item === "object" &&
            "id" in item &&
            Array.isArray((item as Record<string, unknown>).id)
          ) {
            row = (item as Record<string, unknown>).id as unknown[];
          } else if (item !== null && typeof item === "object") {
            // GAS修正後の「オブジェクト形式」を想定したフォールバック
            const obj = item as any;
            return {
              id: Number(obj.id),
              details: String(obj.details || ""),
              unknownWords: String(obj.unknownWords || "[]"),
              relatedLinks: String(obj.relatedLinks || "[]"),
              ownWords: String(obj.ownWords || ""),
              metaphor: String(obj.metaphor || ""),
              categories: String(obj.categories || "[]"),
              isUsed: Boolean(obj.isUsed),
              draftUrl: String(obj.draftUrl || ""),
              createdAt: String(obj.createdAt || ""),
              updatedAt: String(obj.updatedAt || ""),
              technicalUnderstanding: String(
                obj.technicalUnderstanding || "{}",
              ),

              thinkingTraining: String(obj.thinkingTraining || "{}"),
              activeMode: (obj.activeMode || "understanding") as ActiveMode,
              structuringItem: String(obj.structuringItem || "{}"),
            };
          } else {
            console.warn(`Item at index ${index} is invalid format:`, item);
            return null;
          }

          if (row.length === 0) return null;

          // 配列インデックスに基づいたマッピング
          const rawId = row;
          if (typeof rawId === "string" && rawId === "id") return null; // ヘッダー除外

          const parsedId = typeof rawId === "number" ? rawId : Number(rawId);
          const validId = Number.isNaN(parsedId)
            ? Date.now() + index
            : parsedId;

          return {
            id: validId,
            details: String(row[3] || ""),
            unknownWords: String(row[4] || "[]"),
            relatedLinks: String(row[5] || "[]"),
            ownWords: String(row[6] || ""),
            metaphor: String(row[7] || ""),
            categories: String(row[8] || "[]"),
            isUsed: Boolean(row[9] || false),
            draftUrl: String(row[10] || ""),
            createdAt: String(row[11] || ""),
            updatedAt: String(row[12] || ""),
            technicalUnderstanding: String(row[13] || "{}"),
            thinkingTraining: String(row[14] || "{}"),
            activeMode: (row[15] || "understanding") as ActiveMode,
            structuringItem: String(row[16] || "{}"),
          };
        })
        .filter((idea: StockIdea | null): idea is StockIdea => idea !== null);

      return result;
    }

    return [];
  } catch (error) {
    console.error("Error fetching ideas from GAS:", error);
    return [];
  }
}

// データ追加 (POST)
export async function addStockIdea(data: StockIdeaInput): Promise<boolean> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return false;

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "add_stock", // ここで内部的に付与する
        ...data,
      }),
    });
    const result = await response.json();

    console.log("result", result);
    return result.success === true;
  } catch (error) {
    console.error("Error adding stock:", error);
    return false;
  }
}

export async function updateStockIdea(
  data: StockIdeaInput & { id: number }, // idは必須だがactionは含めない
): Promise<boolean> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return false;

  console.log("data", data);
  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "update_stock", // ここで内部的に付与する
        ...data,
      }),
    });
    const result = await response.json();
    console.log("updateStockIdea", result);
    return result.success === true;
  } catch (error) {
    console.error("Error updating stock:", error);
    return false;
  }
}
