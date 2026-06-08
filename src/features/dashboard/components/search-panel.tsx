"use client";

import { useState, useEffect } from "react";
// ※パスは既存の構成に沿っています
import { StockIdea } from "@/lib/gas-api";
import { fetchStockIdeas } from "../api/gas-client";
import IdeaDetailModal from "./idea-detail-modal";

/**
 * JSON文字列を安全にパースするためのヘルパー関数
 * 理由: GASから渡されるデータ（idea.categories）はJSON形式の文字列であるため、
 * そのまま表示すると ["単語の違い"] のようにブラケットやダブルクォーテーションごと表示されてしまう。
 * また、不正な文字が入っていた際の parse エラーによるクラッシュを防ぐ。
 */
function safeParse<T>(value: string, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}

export default function SearchPanel() {
  const [selectedIdea, setSelectedIdea] = useState<StockIdea | null>(null);
  const [ideas, setIdeas] = useState<StockIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedIdeas = await fetchStockIdeas();
        setIdeas(fetchedIdeas);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    loadIdeas();
  }, []);

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-bold">確認・検索</h2>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="キーワード検索..."
          className="w-full rounded border border-white/10 bg-[#121214] p-2 text-white/90"
        />
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-white/50">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-red-500">{error}</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-white/50">登録されたアイデアがありません。</p>
        </div>
      ) : (
        <div className="custom-scrollbar flex flex-col gap-3 overflow-y-auto">
          {ideas.map((idea) => {
            // リスト描画時に、安全にカテゴリの文字列を配列へ復元する
            const categories = safeParse<string[]>(idea.categories, []);

            return (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  {/* カテゴリのタグ表示 */}
                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((cat, i) => (
                        <span
                          key={i}
                          className="rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-300"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-white/40">
                        未分類
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/50">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-white/80">
                  詳細：{idea.details || "詳細なし"}
                </p>

                <p className="mt-2 line-clamp-2 text-sm text-white/80">
                  自分の言葉：{idea.ownWords || "詳細なし"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
}
