import { useState, useEffect, useMemo } from "react";
import { fetchStockIdeas } from "../api/gas-client";
import {
  ParsedStockIdea,
  TechnicalUnderstanding,
  ThinkingTraining,
} from "../types";
import { safeParse } from "../utils/parse";

export function useSearch() {
  const [ideas, setIdeas] = useState<ParsedStockIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ParsedStockIdea | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 検索条件ステート
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // データ取得と初期パース（ここで一括してパースしておくことで、モーダル側での再パースを不要にする）
  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoading(true);
      try {
        const fetchedIdeas = await fetchStockIdeas();
        const parsedIdeas: ParsedStockIdea[] = fetchedIdeas.map((idea) => ({
          ...idea,
          parsedTechnicalUnderstanding: safeParse<TechnicalUnderstanding>(
            idea.technicalUnderstanding,
            {} as TechnicalUnderstanding,
          ),
          parsedThinkingTraining: safeParse<ThinkingTraining>(
            idea.thinkingTraining,
            {} as ThinkingTraining,
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
        setError("データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    loadIdeas();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    ideas.forEach((idea) =>
      idea.parsedCategories.forEach((cat) => categories.add(cat)),
    );
    return Array.from(categories);
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchSearchTerm = idea.details
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory
        ? idea.parsedCategories.some((cat) =>
            cat.toLowerCase().includes(selectedCategory.toLowerCase()),
          )
        : true;
      let matchDate = true;
      if (startDate || endDate) {
        const ideaDate = new Date(idea.createdAt);
        if (startDate && ideaDate < new Date(startDate)) matchDate = false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (ideaDate > end) matchDate = false;
        }
      }
      return matchSearchTerm && matchCategory && matchDate;
    });
  }, [ideas, searchTerm, selectedCategory, startDate, endDate]);

  const handleDownloadMarkdown = () => {
    if (filteredIdeas.length === 0)
      return alert("ダウンロードするデータがありません。");
    let mdContent = "# 思考ストック一覧\n\n";
    filteredIdeas.forEach((idea) => {
      const date = new Date(idea.createdAt).toLocaleDateString();
      const categories =
        idea.parsedCategories.length > 0
          ? idea.parsedCategories.join(", ")
          : "未分類";
      mdContent += `## [${date}] カテゴリ: ${categories}\n\n**詳細:**\n${idea.details || "詳細なし"}\n\n`;
      // ... (既存のマークダウン生成ロジック) ...
      mdContent += `---\n\n`;
    });
    const blob = new Blob([mdContent], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `思考ストック一覧-${new Date().toISOString().split("T")[0]}.md`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    state: {
      isLoading,
      error,
      filteredIdeas,
      availableCategories,
      searchTerm,
      selectedCategory,
      startDate,
      endDate,
      selectedIdea,
    },
    setters: {
      setSearchTerm,
      setSelectedCategory,
      setStartDate,
      setEndDate,
      setSelectedIdea,
    },
    handlers: { handleDownloadMarkdown },
  };
}
