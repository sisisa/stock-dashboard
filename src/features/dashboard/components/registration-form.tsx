"use client";

import { useState, useEffect } from "react";
import { addStockIdea, StockIdeaInput } from "@/lib/gas-api";

interface UnknownWord {
  word: string;
  result: string;
}

interface LinkItem {
  memo: string;
  url: string;
  title: string;
}

interface DraftData {
  details?: string;
  unknownWords?: UnknownWord[];
  links?: LinkItem[];
  ownWords?: string;
  metaphor?: string;
  categories?: string[];
}

export default function RegistrationForm() {
  const [details, setDetails] = useState("");
  const [unknownWords, setUnknownWords] = useState<UnknownWord[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [ownWords, setOwnWords] = useState("");
  const [metaphor, setMetaphor] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");

  const [categoryHistory, setCategoryHistory] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. ローカルストレージからの復元
  useEffect(() => {
    const savedData = localStorage.getItem("draft_idea_stock");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as DraftData;
        if (parsed.details) setDetails(parsed.details);
        if (parsed.unknownWords) setUnknownWords(parsed.unknownWords);
        if (parsed.links) setLinks(parsed.links);
        if (parsed.ownWords) setOwnWords(parsed.ownWords);
        if (parsed.metaphor) setMetaphor(parsed.metaphor);
        if (parsed.categories) setCategories(parsed.categories);
      } catch (error) {
        console.error("Failed to parse draft data", error);
      }
    }

    const savedHistory = localStorage.getItem("category_history");
    if (savedHistory) {
      try {
        setCategoryHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse category history", error);
      }
    }
  }, []);

  // 2. 入力ごとの一時保存ロジック
  const saveToStorage = (newData: Partial<DraftData>) => {
    const currentDataRaw = localStorage.getItem("draft_idea_stock");
    const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : {};
    localStorage.setItem(
      "draft_idea_stock",
      JSON.stringify({ ...currentData, ...newData }),
    );
  };

  // 3. 各入力ハンドラー
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
      setLinkInput("");
    }
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

      // 履歴の更新
      if (!categoryHistory.includes(trimmed)) {
        const newHistory = [...categoryHistory, trimmed];
        setCategoryHistory(newHistory);
        localStorage.setItem("category_history", JSON.stringify(newHistory));
      }
    }
    setCategoryInput("");
  };

  // 4. 完了（送信）処理
  const handleComplete = async () => {
    setIsSubmitting(true);
    const payload: StockIdeaInput = {
      details,
      unknownWords: JSON.stringify(unknownWords),
      relatedLinks: JSON.stringify(links),
      ownWords,
      metaphor,
      categories: JSON.stringify(categories),
    };

    const result = await addStockIdea(payload);
    setIsSubmitting(false);

    if (result) {
      alert("保存が完了しました。ロックを解除します。");
      localStorage.removeItem("draft_idea_stock");
      setDetails("");
      setUnknownWords([]);
      setLinks([]);
      setOwnWords("");
      setMetaphor("");
      setCategories([]);
    } else {
      alert("保存に失敗しました。時間をおいて再試行してください。");
    }
  };

  return (
    <div className="custom-scrollbar flex h-full flex-col gap-5 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-bold">アイデア・メモの登録</h2>

      {/* 詳細の記載 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          詳細の記載
        </label>
        <textarea
          value={details}
          onChange={(e) => {
            setDetails(e.target.value);
            saveToStorage({ details: e.target.value });
          }}
          placeholder="ここに詳細を記載します..."
          rows={3}
          className="custom-scrollbar text w-full resize-none rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* わからない単語と調査結果 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          わからない単語と調査した結果
        </label>
        {unknownWords.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              placeholder="単語"
              value={item.word}
              onChange={(e) => updateUnknownWord(idx, "word", e.target.value)}
              className="w-1/3 rounded-lg border border-white bg-black/40 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="調査結果"
              value={item.result}
              onChange={(e) => updateUnknownWord(idx, "result", e.target.value)}
              className="w-2/3 rounded-lg border border-white bg-black/40 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
        <div className="flex justify-end">
          <button
            onClick={addUnknownWord}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold transition-colors hover:bg-white/20"
          >
            ＋ 行を追加
          </button>
        </div>
      </div>

      {/* 関連リンク（課題対応用コピペ対応） */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          関連リンク（課題対応用コピペ対応）
        </label>
        <input
          type="text"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onPaste={handleLinkPaste}
          placeholder="<メモ, URL, タイトル> またはURLをコピペ"
          className="w-full rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        {links.length > 0 && (
          <ul className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="flex flex-col rounded border border-white/10 bg-white/5 p-2 text-xs"
              >
                <span className="font-bold text-blue-400">{link.title}</span>
                <span className="text-white/80">{link.memo}</span>
                <span className="text-white/50">{link.url}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 自分の言葉で整理 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          自分の言葉で整理
        </label>
        <textarea
          value={ownWords}
          onChange={(e) => {
            setOwnWords(e.target.value);
            saveToStorage({ ownWords: e.target.value });
          }}
          rows={2}
          className="w-full resize-none rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* たとえを考える */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          たとえを考える
        </label>
        <textarea
          value={metaphor}
          onChange={(e) => {
            setMetaphor(e.target.value);
            saveToStorage({ metaphor: e.target.value });
          }}
          rows={2}
          className="w-full resize-none rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* カテゴリ登録 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          カテゴリ登録
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory(categoryInput)}
            placeholder="カテゴリを入力してEnter"
            className="flex-1 rounded-lg border border-white bg-black/40 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => addCategory(categoryInput)}
            className="rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs text-blue-300"
            >
              {cat}
            </span>
          ))}
        </div>
        {categoryHistory.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40">履歴:</span>
            {categoryHistory.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => addCategory(cat)}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60 hover:bg-white/10"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "送信中..." : "完了"}
        </button>
      </div>
    </div>
  );
}
