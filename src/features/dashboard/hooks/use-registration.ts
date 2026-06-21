import { useState, useEffect, useCallback } from "react";
import { addStockIdea, updateStockIdea } from "../api/gas-client";
import {
  StockIdeaInput,
  TechnicalUnderstanding,
  ThinkingTraining,
  UnknownWord,
  LinkItem,
  DraftData,
  ParsedStockIdea,
} from "../types";

import type { StructuringItem } from "../types/training";
import { defaultStructuringItem } from "../types/training";

type StructuringSection = keyof StructuringItem;
// "Purpose" "Piece"

// 思考トレーニングの初期値テンプレート
const defaultTrainingData: ThinkingTraining = {
  theme: "",
  issue: "",
  exclusion: "",
  fiveW1H: { when: "", where: "", what: "", who: "", why: "", how: "" },
  otherPerspective: { a: "", b: "", c: "", common: "" },
  ownOpinion: { op1: "", op2: "", op3: "", common: "" },
  whySo: { question: "", answers: ["", "", "", "", ""] },
  soWhat: { question: "", answers: ["", "", "", "", ""] },
  goodLineLog: "",
  commonalities: { targetA: "", targetB: "", points: [], structure: "" },
  concreteToAbstract: { concrete: "", abstract: "" },
  abstractToConcrete: { concrete: "", abstract: "" },
  analogy: { summary: "", analogy: "", reason: "" },
  logicCheck: { conclusion: "", reason: "", example: "", meaning: "" },
  oneSentence: "",
  discovery: "",
};

export function useRegistration() {
  // 1. ステート管理
  const [id, setId] = useState<number | null>(null); // 更新用にIDを保持
  const [details, setDetails] = useState("");
  const [activeTab, setActiveTab] = useState("understanding");
  const [activeMode, setActiveMode] = useState<"understanding" | "training">(
    "understanding",
  );
  const [techUnderstanding, setTechUnderstanding] =
    useState<TechnicalUnderstanding>({
      why: "",
      problem: "",
      mechanism: "",
      trigger: "",
      without: "",
      demerit: "",
      situation: "",
      analogy: "",
      difference: "",
    });

  const [structuringItem, setStructuringItem] = useState<StructuringItem>(
    defaultStructuringItem,
  );

  const [thinkingTraining, setThinkingTraining] =
    useState<ThinkingTraining>(defaultTrainingData);
  const [unknownWords, setUnknownWords] = useState<UnknownWord[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linkMemo, setLinkMemo] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [ownWords, setOwnWords] = useState("");
  const [metaphor, setMetaphor] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 2. 【新規】既存データをフォームにセットする関数
  // useSearchですでにパース済みのデータ(ParsedStockIdea)を受け取るとスムーズです
  const initializeForm = useCallback((idea: ParsedStockIdea) => {
    setId(idea.id);
    setDetails(idea.details);
    setActiveMode(idea.activeMode as "understanding" | "training");
    setTechUnderstanding(idea.parsedTechnicalUnderstanding);
    setThinkingTraining(idea.parsedThinkingTraining);
    setUnknownWords(idea.parsedUnknownWords);
    setLinks(idea.parsedRelatedLinks);
    setOwnWords(idea.ownWords || "");
    setMetaphor(idea.metaphor || "");
    setCategories(idea.parsedCategories);
    setStructuringItem({
      ...defaultStructuringItem,
      ...idea.parsedStructuringItem,
      Purpose: {
        ...defaultStructuringItem.Purpose,
        ...idea.parsedStructuringItem?.Purpose,
      },
    }); //構造化
    console.log("parsedStructuringItem", idea.parsedStructuringItem);
  }, []);

  // 3. ストレージ（保存・呼び出し）ロジック
  useEffect(() => {
    if (id) return;

    const savedData = localStorage.getItem("draft_idea_stock");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as DraftData;
        if (parsed.details) setDetails(parsed.details);
        if (parsed.activeMode)
          setActiveMode(parsed.activeMode as "understanding" | "training");
        if (parsed.technicalUnderstanding)
          setTechUnderstanding(parsed.technicalUnderstanding);
        if (parsed.thinkingTraining)
          setThinkingTraining(parsed.thinkingTraining);
        if (parsed.unknownWords) setUnknownWords(parsed.unknownWords);
        if (parsed.links) setLinks(parsed.links);
        if (parsed.ownWords) setOwnWords(parsed.ownWords);
        if (parsed.metaphor) setMetaphor(parsed.metaphor);
        if (parsed.categories) setCategories(parsed.categories);

        // 構造化
        // if (parsed.structuringItem) setStructuringItem(parsed.structuringItem);
      } catch (error) {
        console.error("Failed to parse draft data", error);
      }
    }
  }, []);

  const saveToStorage = (newData: Partial<DraftData>) => {
    if (id) return;
    const currentDataRaw = localStorage.getItem("draft_idea_stock");
    const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : {};
    localStorage.setItem(
      "draft_idea_stock",
      JSON.stringify({ ...currentData, ...newData }),
    );
  };

  // 3. 各種ハンドラー（UIからの操作）
  const handleTechUnderstandingChange = (
    field: keyof TechnicalUnderstanding,
    value: string,
  ) => {
    const newData = { ...techUnderstanding, [field]: value };
    setTechUnderstanding(newData);
    saveToStorage({ technicalUnderstanding: newData });
  };

  const handleStructuringItemChange = <
    S extends StructuringSection,
    F extends keyof StructuringItem[S],
  >(
    section: S,
    field: F,
    value: string,
  ) => {
    setStructuringItem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handlePieceChange = (index: number, value: string) => {
    setStructuringItem((prev) => {
      const next = [...prev.Piece];

      next[index] = value;

      // 最後の入力欄に文字が入力されたら
      // 空欄を1つ追加する
      if (index === next.length - 1 && value.trim() !== "") {
        next.push("");
      }

      return {
        ...prev,
        Piece: next,
      };
    });
  };

  const addUnknownWord = () => {
    const newWords = [...unknownWords, { word: "", result: "" }];
    setUnknownWords(newWords);
    saveToStorage({ unknownWords: newWords });
  };

  const updateUnknownWord = (
    index: number,
    field: keyof UnknownWord,
    value: string,
  ) => {
    const newWords = [...unknownWords];
    newWords[index][field] = value;
    setUnknownWords(newWords);
    saveToStorage({ unknownWords: newWords });
  };

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const newCategories = [...categories, trimmed];
      setCategories(newCategories);
      saveToStorage({ categories: newCategories });
    }
    setCategoryInput("");
  };

  const handleLinkPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const specialFormatRegex = /<(.*?),\s*(https?:\/\/[^\s,>]+),\s*(.*?)>/;
    const match = pastedText.match(specialFormatRegex);
    if (match) {
      e.preventDefault();
      const newLinks = [
        ...links,
        { memo: match[1].trim(), url: match[2].trim(), title: match[3].trim() },
      ];
      setLinks(newLinks);
      saveToStorage({ links: newLinks });
    }
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const newLinks = [
      ...links,
      { memo: linkMemo.trim(), url, title: linkTitle.trim() },
    ];
    setLinks(newLinks);
    saveToStorage({ links: newLinks });
    setLinkMemo("");
    setLinkUrl("");
    setLinkTitle("");
  };

  const handleCopySpecialFormat = (link: LinkItem, index: number) => {
    navigator.clipboard
      .writeText(`<${link.memo}, ${link.url}, ${link.title}>`)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    saveToStorage({ links: newLinks });
  };

  // 4. 送信処理（API通信）
  const handleComplete = async () => {
    if (!details.trim()) return;
    setIsSubmitting(true);

    const payload: StockIdeaInput = {
      details,
      technicalUnderstanding: JSON.stringify(techUnderstanding),
      thinkingTraining: JSON.stringify(thinkingTraining),
      activeMode: activeTab,
      unknownWords: JSON.stringify(unknownWords),
      relatedLinks: JSON.stringify(links),
      ownWords,
      metaphor,
      categories: JSON.stringify(categories),
    };

    console.log("id", id);

    try {
      let result;
      if (id) {
        // GAS側の更新アクション(例: update_stock)を呼び出す
        console.log("updateStockIdea", payload);
        result = await updateStockIdea({ ...payload, id });
      } else {
        console.log("id", id);
        result = await addStockIdea(payload);
      }

      if (result) {
        if (!id) {
          localStorage.removeItem("draft_idea_stock");
          setDetails("");
          setUnknownWords([]);
          setLinks([]);
          setOwnWords("");
          setMetaphor("");
          setCategories([]);
          setTechUnderstanding({
            why: "",
            problem: "",
            mechanism: "",
            trigger: "",
            without: "",
            demerit: "",
            situation: "",
            analogy: "",
            difference: "",
          });
          setStructuringItem(defaultStructuringItem);
          setThinkingTraining(defaultTrainingData);
          alert("登録が完了しました");
        }
        return true;
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
    return false;
  };

  // UI側で必要な情報だけを返す
  return {
    state: {
      id,
      details,
      activeMode,
      techUnderstanding,
      thinkingTraining,
      unknownWords,
      links,
      linkMemo,
      linkUrl,
      linkTitle,
      ownWords,
      metaphor,
      categories,
      categoryInput,
      isSubmitting,
      copiedIndex,
      activeTab,
      structuringItem,
    },
    setters: {
      setDetails,
      setActiveMode,
      setLinkMemo,
      setLinkUrl,
      setLinkTitle,
      setOwnWords,
      setMetaphor,
      setCategories,
      setCategoryInput,
      setThinkingTraining,
      setActiveTab,
      setStructuringItem,
    },
    handlers: {
      saveToStorage,
      handleTechUnderstandingChange,
      addUnknownWord,
      updateUnknownWord,
      addCategory,
      setCategories,
      handleLinkPaste,
      handleAddLink,
      handleCopySpecialFormat,
      handleRemoveLink,
      handleComplete,
      initializeForm,
      handleStructuringItemChange,
      handlePieceChange,
    },
  };
}
