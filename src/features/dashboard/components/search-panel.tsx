"use client";

import { useState, useEffect, useMemo } from "react";
import { ParsedStockIdea, TechnicalUnderstanding } from "../types";
import { fetchStockIdeas } from "../api/gas-client";
import IdeaDetailModal from "./idea-detail-modal";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";

import { Button } from "@/components/ui/button";

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
  const [selectedIdea, setSelectedIdea] = useState<ParsedStockIdea | null>(
    null,
  );
  const [ideas, setIdeas] = useState<ParsedStockIdea[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 検索用のステート
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // データの呼び出し
  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedIdeas = await fetchStockIdeas();
        const parsedIdeas: ParsedStockIdea[] = fetchedIdeas.map((idea) => ({
          ...idea,
          // 技術理解フレームワークのパース
          parsedTechnicalUnderstanding: safeParse<TechnicalUnderstanding>(
            idea.technicalUnderstanding,
            {
              why: "",
              problem: "",
              analogy: "",
              mechanism: "",
              trigger: "",
              without: "",
              demerit: "",
              situation: "",
              difference: "",
            },
          ),
          parsedCategories: safeParse<string[]>(idea.categories, []),
          parsedUnknownWords: safeParse<{ word: string; result: string }[]>(
            idea.unknownWords,
            [],
          ),
          parsedRelatedLinks: safeParse<
            { memo: string; url: string; title: string }[]
          >(idea.relatedLinks, []),
        }));
        setIdeas(parsedIdeas);
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
    console.log("カテゴリ", ideas);
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

  // マークダウンダウンロード機能
  const handleDownloadMarkdown = () => {
    // ダウンロードする対象：ideas(filteredIdeasは名前の通り、ideasを検索してフィルタリングした後の値)
    const targetIdeas = filteredIdeas;

    if (targetIdeas.length === 0) {
      alert("ダウンロードするデータがありません。");
      return;
    }

    // 1. マークダウンテキストの生成
    let mdContent = "# 思考ストック一覧\n\n";

    targetIdeas.forEach((idea) => {
      const date = new Date(idea.createdAt).toLocaleDateString();
      const categories =
        idea.parsedCategories.length > 0
          ? idea.parsedCategories.join(", ")
          : "未分類";

      mdContent += `## [${date}] カテゴリ: ${categories}\n\n`;
      mdContent += `**詳細:**\n${idea.details || "詳細なし"}\n\n`;

      // わからなかった単語がある場合
      if (idea.parsedUnknownWords && idea.parsedUnknownWords.length > 0) {
        mdContent += `**不明な単語:**\n`;
        idea.parsedUnknownWords.forEach((wordObj) => {
          mdContent += `- ${wordObj.word}: ${wordObj.result}\n`;
        });
        mdContent += `\n`;
      }

      // 関連リンクがある場合
      if (idea.parsedRelatedLinks && idea.parsedRelatedLinks.length > 0) {
        mdContent += `**関連リンク:**\n`;
        idea.parsedRelatedLinks.forEach((link) => {
          const memoStr = link.memo ? ` (${link.memo})` : "";
          mdContent += `- [${link.title || link.url}](${link.url})${memoStr}\n`;
        });
        mdContent += `\n`;
      }

      mdContent += `---\n\n`;
    });

    // 2. ブラウザ上でファイルを生成してダウンロード
    const blob = new Blob([mdContent], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // ファイル名に今日の日付を入れる
    const today = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `思考ストック一覧-${today}.md`);

    // 一時的にDOMに追加してクリックイベントを発火し、すぐに消す
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex gap-4 border-white">
        <h1 className="text-xl font-bold">確認・検索</h1>
        <Button
          onClick={handleDownloadMarkdown}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          マークダウンダウンロード
        </Button>
      </div>

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
            return (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {idea.parsedCategories.length > 0 ? (
                      idea.parsedCategories.map((cat, i) => (
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
