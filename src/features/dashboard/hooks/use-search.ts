import { useState, useEffect, useMemo } from "react";
import { fetchStockIdeas } from "../api/gas-client";
import { defaultStructuringItem } from "../types/training";
import type { ParsedStockIdea } from "../types/database";

import type { ActiveMode } from "../types/common";

import type {
  StructuringItem,
  ThinkingTraining,
  TechnicalUnderstanding,
} from "../types/training";

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
  const [selectedMode, setSelectedMode] = useState<ActiveMode | "">("");
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
          activeMode: idea.activeMode as ActiveMode,
          parsedTechnicalUnderstanding: safeParse<TechnicalUnderstanding>(
            idea.technicalUnderstanding,
            {} as TechnicalUnderstanding,
          ),
          structuringItem: idea.structuringItem ?? "",

          parsedStructuringItem: safeParse(
            idea.structuringItem ?? "",
            defaultStructuringItem,
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

        console.log("parsedIdeas", parsedIdeas);
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
      // モードの検索
      const matchMode = selectedMode ? idea.activeMode === selectedMode : true;

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
      return matchSearchTerm && matchCategory && matchMode && matchDate;
    });
  }, [ideas, searchTerm, selectedCategory, selectedMode, startDate, endDate]);

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
      selectedMode,
    },
    setters: {
      setSearchTerm,
      setSelectedCategory,
      setStartDate,
      setEndDate,
      setSelectedIdea,
      setSelectedMode,
    },
  };
}
