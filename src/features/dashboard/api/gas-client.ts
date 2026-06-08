import { StockIdea } from "../types";

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
      return json.data as StockIdea[];
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
