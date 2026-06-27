/**
 * アイデア登録画面全体の状態管理を行うカスタムフック。
 *
 * 主な役割
 * ・フォーム状態管理
 * ・下書き保存(localStorage)
 * ・既存データの読み込み
 * ・入力補助処理
 * ・登録／更新API実行
 */
import { useState, useEffect, useCallback } from "react";
import { addStockIdea, updateStockIdea } from "../api/gas-client";

import type {
  StructuringItem,
  ThinkingTraining,
  TechnicalUnderstanding,
} from "../types/training";

import {
  defaultStructuringItem,
  defaultThinkingTrainingData,
  defaultTechnicalUnderstanding,
} from "../types/training";

import type {
  DraftData,
  ParsedStockIdea,
  StockIdeaInput,
} from "../types/database";

import type { UnknownWord, LinkItem } from "../types/common";

type StructuringSection = keyof StructuringItem;
// "Purpose" "Piece"

export function useRegistration() {
  // 1. ステート管理
  const [id, setId] = useState<number | null>(null); // 更新用にIDを保持
  const [details, setDetails] = useState("");

  // モード管理
  const [activeTab, setActiveTab] = useState("understanding");
  const [activeMode, setActiveMode] = useState<"understanding" | "training">(
    "understanding",
  );

  // 理解モード
  const [techUnderstanding, setTechUnderstanding] =
    useState<TechnicalUnderstanding>(defaultTechnicalUnderstanding);

  // 構造化モード
  const [structuringItem, setStructuringItem] = useState<StructuringItem>(
    defaultStructuringItem,
  );

  // 思考トレーニングモード
  const [thinkingTraining, setThinkingTraining] = useState<ThinkingTraining>(
    defaultThinkingTrainingData,
  );
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

  // 2. 既存データをフォームにセットする関数
  // useSearchですでにパース済みのデータ(ParsedStockIdea)を受け取るとスムーズです
  const initializeForm = useCallback((idea: ParsedStockIdea) => {
    setId(idea.id);
    setDetails(idea.details);

    setActiveMode(idea.activeMode as "understanding" | "training");
    setTechUnderstanding({
      ...defaultTechnicalUnderstanding,
      ...idea.parsedTechnicalUnderstanding,
    });
    setThinkingTraining({
      ...defaultThinkingTrainingData,

      ...idea.parsedThinkingTraining,

      fiveW1H: {
        ...defaultThinkingTrainingData.fiveW1H,
        ...idea.parsedThinkingTraining?.fiveW1H,
      },

      otherPerspective: {
        ...defaultThinkingTrainingData.otherPerspective,
        ...idea.parsedThinkingTraining?.otherPerspective,
      },

      ownOpinion: {
        ...defaultThinkingTrainingData.ownOpinion,
        ...idea.parsedThinkingTraining?.ownOpinion,
      },

      whySo: {
        ...defaultThinkingTrainingData.whySo,
        ...idea.parsedThinkingTraining?.whySo,
      },

      soWhat: {
        ...defaultThinkingTrainingData.soWhat,
        ...idea.parsedThinkingTraining?.soWhat,
      },

      commonalities: {
        ...defaultThinkingTrainingData.commonalities,
        ...idea.parsedThinkingTraining?.commonalities,
      },

      concreteToAbstract: {
        ...defaultThinkingTrainingData.concreteToAbstract,
        ...idea.parsedThinkingTraining?.concreteToAbstract,
      },

      abstractToConcrete: {
        ...defaultThinkingTrainingData.abstractToConcrete,
        ...idea.parsedThinkingTraining?.abstractToConcrete,
      },

      analogy: {
        ...defaultThinkingTrainingData.analogy,
        ...idea.parsedThinkingTraining?.analogy,
      },

      logicCheck: {
        ...defaultThinkingTrainingData.logicCheck,
        ...idea.parsedThinkingTraining?.logicCheck,
      },
    });
    setUnknownWords(idea.parsedUnknownWords);
    setLinks(idea.parsedRelatedLinks);
    setOwnWords(idea.ownWords || "");
    setMetaphor(idea.metaphor || "");
    setCategories(idea.parsedCategories);
    console.log("parsedStructuringItem", idea.parsedStructuringItem);
    setStructuringItem({
      ...defaultStructuringItem,
      ...idea.parsedStructuringItem,

      Purpose: {
        ...defaultStructuringItem.Purpose,
        ...idea.parsedStructuringItem.Purpose,
      },

      Piece:
        idea.parsedStructuringItem.Piece.length > 0
          ? idea.parsedStructuringItem.Piece
          : defaultStructuringItem.Piece,
    }); //構造化
    console.log("parsedStructuringItem", idea.parsedStructuringItem);
  }, []);

  // 3. ストレージ（保存・呼び出し）ロジック
  /**
   * 新規作成時のみ
   * localStorageの下書きを復元する
   * 編集モード(idあり)の場合はDBデータを優先するため実行しない。
   */
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
        if (parsed.structuringItem) setStructuringItem(parsed.structuringItem);
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

  /**
   * Piece更新処理
   * Pieceは可変長配列として管理する。
   * 最後の入力欄に文字が入力された場合、
   * 自動的に空欄を1つ追加する。
   * ユーザーは「追加ボタン」を意識せず入力だけに集中できる。
   */
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

  /**
   登録フォームを初期状態へ戻す
   新規登録完了後や「リセット」機能など、フォームを初期状態に戻したい場面で共通利用する。
   初期値は training.ts に定義した default○○ を利用し、
   初期化内容を一箇所で管理できるようにする。
   */
  const resetForm = () => {
    setDetails("");

    setUnknownWords([]);
    setLinks([]);
    setOwnWords("");
    setMetaphor("");
    setCategories([]);

    setTechUnderstanding(defaultTechnicalUnderstanding);
    setStructuringItem(defaultStructuringItem);
    setThinkingTraining(defaultThinkingTrainingData);
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
      structuringItem: JSON.stringify(structuringItem),
    };

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
          resetForm();
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
