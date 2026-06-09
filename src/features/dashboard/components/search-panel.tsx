"use client";

import { useState, useEffect, useMemo } from "react";
import { StockIdea } from "@/lib/gas-api";
import { fetchStockIdeas } from "../api/gas-client";
import IdeaDetailModal from "./idea-detail-modal";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
/**
 * JSON文字列を安全にパースするためのヘルパー関数
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

  // 検索用のステート
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // 動的カテゴリリストの生成（ideasが更新された時のみ再計算）
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    ideas.forEach((idea) => {
      const parsed = safeParse<string[]>(idea.categories, []);
      parsed.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  }, [ideas]);

  // クロスフィルタリング処理（ideasや各検索条件が更新された時のみ再計算）
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // 1. 詳細からの検索（大文字・小文字を区別しない）
      const matchSearchTerm = idea.details
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 2. カテゴリからの検索
      let matchCategory = true;
      if (selectedCategory) {
        const parsedCategories = safeParse<string[]>(idea.categories, []);
        // 手入力による曖昧検索（部分一致）に対応させるため、includes に変更
        matchCategory = parsedCategories.some((cat) =>
          cat.toLowerCase().includes(selectedCategory.toLowerCase()),
        );
      }

      // 3. 日付範囲指定での検索
      let matchDate = true;
      if (startDate || endDate) {
        const ideaDate = new Date(idea.createdAt);
        if (startDate) {
          const start = new Date(startDate);
          if (ideaDate < start) matchDate = false;
        }
        if (endDate) {
          // 終了日はその日の23:59:59までを含める
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (ideaDate > end) matchDate = false;
        }
      }

      return matchSearchTerm && matchCategory && matchDate;
    });
  }, [ideas, searchTerm, selectedCategory, startDate, endDate]);

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-bold">確認・検索</h2>

      {/* 検索コントロール群 */}
      <div className="flex flex-col gap-3">
        {/* キーワード検索 */}
        <input
          type="text"
          placeholder="キーワード検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border border-white/10 bg-[#121214] p-2 text-white/90"
        />

        {/* 日付・カテゴリ検索 */}
        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={availableCategories}
            placeholder="カテゴリを検索..."
          />

          <div className="flex items-center gap-2">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="開始日"
            />
            <span className="text-white">〜</span>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="終了日"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-white/50">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-white/50">該当するアイデアがありません。</p>
        </div>
      ) : (
        <div className="custom-scrollbar flex flex-col gap-3 overflow-y-auto">
          {/* ideas ではなく filteredIdeas を map で展開する */}
          {filteredIdeas.map((idea) => {
            const categories = safeParse<string[]>(idea.categories, []);

            return (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
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
                  {idea.details || "詳細なし"}
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
