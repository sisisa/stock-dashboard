/**
 * JSON文字列を安全にパースするための共通ヘルパー関数
 */
export function safeParse<T>(value: string, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}
